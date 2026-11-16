import { HttpError } from './httpError.js';
function hasName(error, name) {
    return error instanceof Error && error.name === name;
}
export function classifyError(error) {
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
//# sourceMappingURL=classifyError.js.map