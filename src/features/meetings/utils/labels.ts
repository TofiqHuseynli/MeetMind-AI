/** How often someone spoke: "Spoke once", "Spoke 4 times". */
export function spokeLabel(count: number): string {
  if (count === 0) return "Did not speak";
  return count === 1 ? "Spoke once" : `Spoke ${count} times`;
}
