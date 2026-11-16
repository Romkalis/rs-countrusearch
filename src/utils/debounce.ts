export function debounce<T>(cb: (...args: T[]) => void, delay: number): (...args: T[]) => void {

  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: T[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => cb(...args), delay)
  }
}
