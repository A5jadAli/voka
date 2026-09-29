// Mirrors the Supabase Auth policy exactly (minimum_password_length = 8,
// password_requirements = "lower_upper_letters_digits_symbols"), so a password the app
// accepts is never rejected by the server. Supabase counts ASCII letters and digits and
// only this symbol set.
const SYMBOLS = `!@#$%^&*()_+-=[]{};'\\:"|<>?,./\`~`;

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'letters', label: 'Upper- and lowercase letters' },
  { key: 'number', label: 'One number' },
  { key: 'special', label: 'One symbol, such as ! ? # @' },
] as const;

export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRequirement = (typeof PASSWORD_REQUIREMENTS)[number]['key'];

export function getPasswordChecks(password: string): Record<PasswordRequirement, boolean> {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letters: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: [...password].some((character) => SYMBOLS.includes(character)),
  };
}

export function isStrongPassword(password: string) {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}
