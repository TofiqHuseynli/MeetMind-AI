/** Share of mock calls that fail, so loading and error states show in the demo. 0 turns it off. */
export const FAILURE_RATE = 0.08;

type Latency = {
  minMs: number;
  maxMs: number;
};

const NETWORK: Latency = { minMs: 300, maxMs: 900 };

/** A model reading a sentence and writing an answer takes longer than a plain read. */
export const MODEL_LATENCY: Latency = { minMs: 1200, maxMs: 2400 };

export class MockNetworkError extends Error {
  constructor() {
    super("The mock service did not respond. Try again.");
    this.name = "MockNetworkError";
  }
}

/** Waits a random moment like a network call would, and sometimes fails like one. */
export async function delay(latency: Latency = NETWORK): Promise<void> {
  const ms = latency.minMs + Math.random() * (latency.maxMs - latency.minMs);
  await new Promise((resolve) => setTimeout(resolve, ms));
  if (Math.random() < FAILURE_RATE) throw new MockNetworkError();
}
