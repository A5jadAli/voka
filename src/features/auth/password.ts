export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: '8 or more characters' },
  { key: 'lowercase', label: 'One lowercase letter' },
  { key: 'uppercase', label: 'One uppercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'symbol', label: 'One special character' },
] as const;

export type PasswordRequirement = (typeof PASSWORD_REQUIREMENTS)[number]['key'];

export function getPasswordChecks(password: string): Record<PasswordRequirement, boolean> {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9\s]/.test(password),
  };
}

export function isStrongPassword(password: string) {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}
