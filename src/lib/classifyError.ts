import { HttpError } from './httpError.js';

export type ErrorKind = 'aborted' | 'timeout' | 'http' | 'network';

export type ClassifiedError = {
  kind: ErrorKind;
  /** Text for the user. Empty for `aborted`, which is never shown. */
  message: string;
};

function hasName(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

/**
 * Splits failures into our own cancellation (silent) and real problems.
 * DOMException extends Error in browsers and Node, so `name` is reliable.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (hasName(error, 'AbortError')) {
    return { kind: 'aborted', message: '' };
  }
  if (hasName(error, 'TimeoutError')) {
    return {
      kind: 'timeout',
      message: 'The server took too long to respond.',
    };
  }
  if (error instanceof HttpError) {
    return {
      kind: 'http',
      message: `Server error (status ${error.status}).`,
    };
  }
  return {
    kind: 'network',
    message: 'Network error. Check your connection.',
  };
}
