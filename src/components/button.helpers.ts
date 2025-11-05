export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ClassNameValue = string | undefined | null | false;

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: ClassNameValue;
}

export function buildButtonClassList({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonClassOptions = {}): string {
  const tokens: string[] = [
    'c-button',
    `c-button--${variant}`,
    `c-button--${size}`,
  ];

  if (fullWidth) {
    tokens.push('c-button--full');
  }

  if (typeof className === 'string') {
    tokens.push(...className.split(/\s+/).filter(Boolean));
  }

  const uniqueTokens: string[] = [];

  for (const token of tokens) {
    if (!token) continue;
    if (!uniqueTokens.includes(token)) {
      uniqueTokens.push(token);
    }
  }

  return uniqueTokens.join(' ');
}

export function resolveElementTag(href?: string | null): 'a' | 'button' {
  return href ? 'a' : 'button';
}

export function resolveRelAttribute(
  target?: string | null,
  rel?: string | null,
): string | undefined {
  if (rel && rel.trim().length > 0) {
    return rel.trim();
  }

  if (target && target.toLowerCase() === '_blank') {
    return 'noopener noreferrer';
  }

  return undefined;
}
