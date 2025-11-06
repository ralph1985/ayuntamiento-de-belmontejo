#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Suggests a semantic version bump based on recent commits and optionally updates package.json.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline';
import path from 'node:path';

const REMOTE_NAME = process.argv[2] || 'origin';
const TARGET_BRANCH = process.argv[3] || '';
const TARGET_SHA = process.argv[4] || '';

const PACKAGE_JSON_PATH = path.resolve('package.json');

function spawnGit(args, options = {}) {
  return spawnSync('git', args, { encoding: 'utf8', ...options });
}

function runGit(args) {
  const result = spawnGit(args);
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim();
}

function resolveBaseRef() {
  let baseRef = null;

  if (TARGET_BRANCH) {
    const remoteTrackingRef = `refs/remotes/${REMOTE_NAME}/${TARGET_BRANCH}`;
    if (runGit(['rev-parse', '--quiet', '--verify', remoteTrackingRef])) {
      const mergeBase = runGit(['merge-base', 'HEAD', remoteTrackingRef]);
      if (mergeBase) {
        baseRef = mergeBase;
      }
    }

    if (
      !baseRef &&
      TARGET_SHA &&
      TARGET_SHA !== '0000000000000000000000000000000000000000' &&
      runGit(['cat-file', '-e', `${TARGET_SHA}^{commit}`]) !== null
    ) {
      baseRef = TARGET_SHA;
    }
  }

  if (!baseRef) {
    const currentBranch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
    const fallbackRemote = currentBranch
      ? `${REMOTE_NAME}/${currentBranch}`
      : null;
    if (
      fallbackRemote &&
      runGit(['rev-parse', '--quiet', '--verify', fallbackRemote])
    ) {
      const mergeBase = runGit(['merge-base', 'HEAD', fallbackRemote]);
      if (mergeBase) {
        baseRef = mergeBase;
      }
    }
  }

  if (
    !baseRef &&
    runGit(['rev-parse', '--quiet', '--verify', `${REMOTE_NAME}/main`])
  ) {
    const mergeBase = runGit(['merge-base', 'HEAD', `${REMOTE_NAME}/main`]);
    if (mergeBase) {
      baseRef = mergeBase;
    }
  }

  if (!baseRef) {
    const firstCommit = runGit(['rev-list', '--max-parents=0', 'HEAD']);
    if (firstCommit) {
      baseRef = firstCommit.split('\n').pop();
    }
  }

  return baseRef;
}

function collectCommits(baseRef) {
  const range = baseRef ? `${baseRef}..HEAD` : 'HEAD';
  const raw = runGit(['log', range, '--pretty=format:%H%x1f%s%x1f%b%x1e']);
  if (!raw) {
    return [];
  }

  return raw
    .split('\x1e')
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => {
      const [hash, subject = '', body = ''] = entry.split('\x1f');
      return { hash, subject, body };
    });
}

const LEVELS = {
  none: 0,
  patch: 1,
  minor: 2,
  major: 3,
};

function classifyCommit(commit) {
  const { subject, body } = commit;

  if (!subject) {
    return 'none';
  }

  const normalizedSubject = subject.trim();
  if (/^Merge /.test(normalizedSubject)) {
    return 'none';
  }

  const conventionalMatch = normalizedSubject.match(
    /^([a-zA-Z]+)(?:\([^)]*\))?(!)?:/
  );
  const type = conventionalMatch?.[1]?.toLowerCase();
  const isBreaking =
    Boolean(conventionalMatch?.[2]) || /BREAKING CHANGE/i.test(body);

  if (isBreaking) {
    return 'major';
  }

  if (type === 'feat') {
    return 'minor';
  }

  if (
    [
      'fix',
      'perf',
      'refactor',
      'style',
      'build',
      'ci',
      'chore',
      'docs',
      'test',
      'revert',
    ].includes(type)
  ) {
    return 'patch';
  }

  if (type) {
    return 'patch';
  }

  return 'patch';
}

function pickBumpLevel(commits) {
  let highest = 'none';
  for (const commit of commits) {
    const level = classifyCommit(commit);
    if (LEVELS[level] > LEVELS[highest]) {
      highest = level;
    }
    if (highest === 'major') {
      break;
    }
  }
  return highest;
}

function incrementVersion(version, level) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `Unsupported version format: "${version}". Expected x.y.z.`
    );
  }

  const [major, minor, patch] = version
    .split('.')
    .map(segment => Number.parseInt(segment, 10));

  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
    throw new Error(`Unable to parse version "${version}".`);
  }

  switch (level) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

function ensureInteractive() {
  return process.stdin.isTTY && process.stdout.isTTY;
}

function prompt(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function promptYes(question) {
  const answer = await prompt(question);
  return answer === 'y' || answer === 'yes';
}

async function main() {
  if (!ensureInteractive()) {
    console.error(
      '⚠️  Cannot suggest version bump in a non-interactive shell.'
    );
    return 2;
  }

  const baseRef = resolveBaseRef();
  const commits = collectCommits(baseRef);

  if (!commits.length) {
    console.error('⚠️  No commits found to analyze for version suggestion.');
    return 2;
  }

  const bumpLevel = pickBumpLevel(commits);
  if (bumpLevel === 'none') {
    console.error(
      '⚠️  No semantic changes detected; version bump suggestion skipped.'
    );
    return 2;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  } catch (error) {
    console.error(`❌ Unable to read ${PACKAGE_JSON_PATH}: ${error.message}`);
    return 1;
  }

  const currentVersion = packageJson.version;
  if (typeof currentVersion !== 'string') {
    console.error(
      '❌ The current package.json does not contain a string "version" field.'
    );
    return 1;
  }

  let nextVersion;
  try {
    nextVersion = incrementVersion(currentVersion, bumpLevel);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    return 1;
  }

  if (currentVersion === nextVersion) {
    console.error(
      '⚠️  Suggested version equals current version; no update applied.'
    );
    return 2;
  }

  const diffSummary = commits
    .map(commit => `- ${commit.hash.slice(0, 7)} ${commit.subject}`)
    .join('\n');

  console.log('🔍 Commits analyzed for version suggestion:');
  console.log(diffSummary);
  console.log('');
  console.log(`Current version: ${currentVersion}`);
  console.log(`Recommended bump type: ${bumpLevel}`);
  console.log(`Proposed new version: ${nextVersion}`);
  console.log('');

  const shouldApply = await promptYes(
    'Apply this version to package.json? [y/N] '
  );
  if (!shouldApply) {
    console.log(
      'ℹ️  Version unchanged. Review the suggestion and update manually if desired.'
    );
    return 2;
  }

  packageJson.version = nextVersion;
  const jsonOutput = JSON.stringify(packageJson, null, 2) + '\n';

  try {
    writeFileSync(PACKAGE_JSON_PATH, jsonOutput, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to write ${PACKAGE_JSON_PATH}: ${error.message}`);
    return 1;
  }

  console.log(`✅ package.json updated to version ${nextVersion}.`);

  const wantsCommit = await promptYes(
    'Create commit with this version now? [y/N] '
  );
  if (!wantsCommit) {
    console.log(
      'ℹ️  Version change ready but not committed. Stage and commit manually when ready.'
    );
    return 0;
  }

  const addResult = spawnGit(['add', 'package.json']);
  if (addResult.status !== 0) {
    console.error('❌ Failed to stage package.json for commit.');
    if (addResult.stderr) {
      console.error(addResult.stderr.trim());
    }
    return 1;
  }

  const commitMessage = `chore(release): bump version to ${nextVersion}`;
  const commitResult = spawnGit([
    'commit',
    '--only',
    'package.json',
    '-m',
    commitMessage,
  ]);

  if (commitResult.status !== 0) {
    console.error('❌ Failed to create commit automatically.');
    if (commitResult.stdout) {
      console.error(commitResult.stdout.trim());
    }
    if (commitResult.stderr) {
      console.error(commitResult.stderr.trim());
    }
    return 1;
  }

  if (commitResult.stdout) {
    console.log(commitResult.stdout.trim());
  }

  const shortHash = runGit(['rev-parse', '--short', 'HEAD']);
  if (shortHash) {
    console.log(`✅ Commit created (${shortHash}): ${commitMessage}`);
  } else {
    console.log(`✅ Commit created: ${commitMessage}`);
  }

  return 0;
}

main()
  .then(exitCode => {
    process.exit(typeof exitCode === 'number' ? exitCode : 0);
  })
  .catch(error => {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
