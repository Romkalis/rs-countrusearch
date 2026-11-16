import { describe, it, expect } from 'vitest';
import { HttpError } from '../lib/httpError.js';

describe('HttpError', () => {
  it('is an instance of Error and of HttpError', () => {
    const error = new HttpError(500);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
  });

  it('stores the HTTP status', () => {
    expect(new HttpError(503).status).toBe(503);
  });

  it('has a recognisable name', () => {
    expect(new HttpError(500).name).toBe('HttpError');
  });

  it('builds a default message from the status', () => {
    expect(new HttpError(500).message).toBe('Request failed with status 500');
  });

  it('accepts a custom message', () => {
    expect(new HttpError(429, 'Too many requests').message).toBe(
      'Too many requests',
    );
  });
});
