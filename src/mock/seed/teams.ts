import type { Project, Team } from "@/types";

export const teams = [
  { id: "t_product", name: "Product" },
  { id: "t_eng", name: "Engineering" },
] satisfies Team[];

export const projects = [
  { id: "p_mobile", name: "Relay Mobile 2.0", teamId: "t_eng" },
  { id: "p_billing", name: "Billing v2", teamId: "t_product" },
  { id: "p_onboarding", name: "Onboarding Redesign", teamId: "t_product" },
  { id: "p_platform", name: "Platform Reliability", teamId: "t_eng" },
] satisfies Project[];
