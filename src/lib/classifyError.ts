export type ErrorKind = 'aborted' | 'timeout' | 'http' | 'network';

export type ClassifiedError = {
  kind: ErrorKind;
  /** Text for the user. Empty for `aborted`, which is never shown. */
  message: string;
};

export function classifyError(error: unknown): ClassifiedError {
  void error;
  return { kind: 'network', message: '' };
}
