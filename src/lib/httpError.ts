export class HttpError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message = `Request failed with status ${status}`,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
