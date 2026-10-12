import type { AvatarTone } from "@/types";

// Static class names so Tailwind finds them; the tone is fixed per person in the seed.
export const speakerBgClass: Record<AvatarTone, string> = {
  "speaker-1": "bg-speaker-1",
  "speaker-2": "bg-speaker-2",
  "speaker-3": "bg-speaker-3",
  "speaker-4": "bg-speaker-4",
  "speaker-5": "bg-speaker-5",
  "speaker-6": "bg-speaker-6",
};
