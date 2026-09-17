type ProfileIdentity = {
  email?: string | null;
  isPermanent: boolean;
  metadata?: Record<string, unknown>;
};

function cleanName(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function getProfileDisplayName({ email, isPermanent, metadata = {} }: ProfileIdentity) {
  if (!isPermanent) return 'Guest learner';

  const metadataName =
    cleanName(metadata.display_name) ||
    cleanName(metadata.full_name) ||
    [cleanName(metadata.first_name), cleanName(metadata.last_name)].filter(Boolean).join(' ');

  return metadataName || cleanName(email?.split('@')[0]) || 'Learner';
}

export function getProfileInitials(displayName: string) {
  const parts = cleanName(displayName).split(' ').filter(Boolean);
  if (parts.length === 0) return 'L';

  const selectedParts = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1) ?? ''];
  return selectedParts
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .toLocaleUpperCase();
}
