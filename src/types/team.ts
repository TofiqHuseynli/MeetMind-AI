import type { MinListQuery } from "./list";

export type Team = {
  id: string;
  name: string;
};

/** A search through the projects, read in batches. */
export type ProjectSearch = {
  q?: string;
  cursor: string | null;
  limit: number;
};

/** The project choices, only one team's with `teamId`. */
export type ProjectMinListQuery = MinListQuery & { teamId?: string };

/** The people choices, only one meeting's with `meetingId`. */
export type PeopleMinListQuery = MinListQuery & { meetingId?: string };

export type Project = {
  id: string;
  name: string;
  teamId: string;
};

/** One of six hues a person keeps everywhere they appear: avatar, transcript, talk strip. */
export const AVATAR_TONES = [
  "speaker-1",
  "speaker-2",
  "speaker-3",
  "speaker-4",
  "speaker-5",
  "speaker-6",
] as const;
export type AvatarTone = (typeof AVATAR_TONES)[number];

export type Person = {
  id: string;
  name: string;
  role: string;
  avatar: { initials: string; tone: AvatarTone };
};
