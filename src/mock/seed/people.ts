import type { Person } from "@/types";

// Lumen Labs builds Relay, a customer messaging product. Everyone here is invented.
export const people = [
  {
    id: "per_amira",
    name: "Amira Haddad",
    role: "Product Manager",
    avatar: { initials: "AH", tone: "speaker-1" },
  },
  {
    id: "per_jonas",
    name: "Jonas Weber",
    role: "Engineering Lead",
    avatar: { initials: "JW", tone: "speaker-2" },
  },
  {
    id: "per_priya",
    name: "Priya Raman",
    role: "Backend Engineer",
    avatar: { initials: "PR", tone: "speaker-3" },
  },
  {
    id: "per_tomas",
    name: "Tomás Ferreira",
    role: "iOS Engineer",
    avatar: { initials: "TF", tone: "speaker-4" },
  },
  {
    id: "per_lena",
    name: "Lena Fischer",
    role: "Product Designer",
    avatar: { initials: "LF", tone: "speaker-5" },
  },
  {
    id: "per_marcus",
    name: "Marcus Oyelaran",
    role: "QA Engineer",
    avatar: { initials: "MO", tone: "speaker-6" },
  },
  {
    id: "per_sofia",
    name: "Sofia Marin",
    role: "Data Analyst",
    avatar: { initials: "SM", tone: "speaker-4" },
  },
  {
    id: "per_daniel",
    name: "Daniel Kim",
    role: "Frontend Engineer",
    avatar: { initials: "DK", tone: "speaker-1" },
  },
  {
    id: "per_elif",
    name: "Elif Yilmaz",
    role: "Customer Success Lead",
    avatar: { initials: "EY", tone: "speaker-3" },
  },
] satisfies Person[];
