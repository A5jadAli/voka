export const PASSWORD_REQUIREMENTS = [{ key: 'length', label: '15 or more characters' }] as const;

export type PasswordRequirement = (typeof PASSWORD_REQUIREMENTS)[number]['key'];

export function getPasswordChecks(password: string): Record<PasswordRequirement, boolean> {
  return {
    length: password.length >= 15,
  };
}

export function isStrongPassword(password: string) {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}
