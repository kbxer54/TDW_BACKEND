export const publicationTypes = [
  "ANNOUNCEMENT",
  "PATCH_NOTE",
  "DEV_LOG",
  "LIVESTREAM",
] as const;

export type PublicationType = (typeof publicationTypes)[number];
