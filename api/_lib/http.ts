/** A failure with the HTTP status the caller gets. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** The JSON answer of a function. */
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

/** Turns a thrown error into its answer; anything unexpected is a 500 without its details. */
export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error);
  return json({ error: "Something went wrong on the server." }, 500);
}
