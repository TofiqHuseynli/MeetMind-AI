import type { Project } from "@/types";
import { delay } from "@/mock/delay";
import * as seed from "@/mock/seed";
import { copy } from "./store";

// The team, project and people reads moved to Supabase (src/supabase/db/teams.ts). This one
// stays while the mock upload checks its project with it, until Task 23.

export async function listProjects(): Promise<Project[]> {
  await delay();
  return copy(seed.projects);
}
