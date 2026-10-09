export const bandosPullRequestTitle = 'chore: actualizar bandos';

export function buildBandosBranchName(date = new Date()) {
  const timestamp = date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
    .replace('T', '-')
    .replace('Z', '');

  return `chore/bandos-sync-${timestamp}`;
}

export function findOpenBandosPullRequest(pullRequests) {
  return (
    pullRequests.find(
      pullRequest =>
        String(pullRequest.state).toUpperCase() === 'OPEN' &&
        pullRequest.title === bandosPullRequestTitle
    ) ?? null
  );
}

export function hasReportedChecks(checks) {
  return Array.isArray(checks) && checks.length > 0;
}

export function isAllowedBandoPath(filePath) {
  return /^src\/content\/bandos\/[^/]+\.md$/.test(filePath);
}
