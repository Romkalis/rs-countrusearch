import { describe, expect, it } from 'vitest';
import { classifyError } from '../lib/classifyError.js';
import { HttpError } from '../lib/httpError.js';

describe('classifyError', () => {
  it('treats our own cancellation (AbortError) as silent', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');

    expect(classifyError(error)).toEqual({ kind: 'aborted', message: '' });
  });

  it('recognises AbortSignal.timeout() as a visible timeout', () => {
    const error = new DOMException('The operation timed out', 'TimeoutError');

    const result = classifyError(error);

    expect(result.kind).toBe('timeout');
    expect(result.message).not.toBe('');
  });

  it('reports HttpError with its status', () => {
    const result = classifyError(new HttpError(500));

    expect(result.kind).toBe('http');
    expect(result.message).toContain('500');
  });

  it('treats a failed fetch as a network error', () => {
    const result = classifyError(new TypeError('Failed to fetch'));

    expect(result.kind).toBe('network');
    expect(result.message).not.toBe('');
  });

  it('falls back to a network error for unknown values', () => {
    expect(classifyError('boom').kind).toBe('network');
  });
});
