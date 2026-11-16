/**
 * A fetch double that behaves like the real one with respect to abort:
 * it rejects with `signal.reason` (AbortError / TimeoutError DOMException)
 * as soon as the signal passed in `init` is aborted.
 */
export function abortableResponse(
  init: RequestInit | undefined,
  response: Response | null,
  delayMs = 0,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const signal = init?.signal;
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer =
      response === null
        ? undefined
        : setTimeout(() => resolve(response), delayMs);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
