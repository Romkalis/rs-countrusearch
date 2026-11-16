export class HttpError extends Error {
    status;
    constructor(status, message = `Request failed with status ${status}`) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}
//# sourceMappingURL=httpError.js.map