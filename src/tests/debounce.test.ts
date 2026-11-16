import { debounce } from '../utils/debounce';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('debounce', () => {
  //включаем фейковые таймеры для всех тестов, чтобы не ждать реального таймера
  beforeEach(() => vi.useFakeTimers());

  it("callback wasn't call immediately", () => {
    const spy = vi.fn();
    const debouncedSpy = debounce(spy, 300);
    debouncedSpy();
    expect(spy).not.toHaveBeenCalled();
  });

  it('callback call on time', () => {
    const spy = vi.fn();
    const debouncedSpy = debounce(spy, 300);

    debouncedSpy();
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('callback called few times', () => {
    const spy = vi.fn();
    const debouncedSpy = debounce(spy, 300);

    debouncedSpy();
    vi.advanceTimersByTime(300);
    debouncedSpy();
    vi.advanceTimersByTime(300);
    debouncedSpy();
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('few shot call give only one call', () => {
    const spy = vi.fn();
    const debouncedSpy = debounce(spy, 300);

    debouncedSpy();
    vi.advanceTimersByTime(100);
    debouncedSpy();
    vi.advanceTimersByTime(200);
    debouncedSpy();
    vi.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('debounce called with right arguments', () => {
    const spy = vi.fn();
    const debouncedSpy = debounce(spy, 300);

    debouncedSpy('i');
    vi.advanceTimersByTime(100);
    debouncedSpy('it');
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('it');
  });

  //вЫключаем фейковые таймеры
  afterEach(() => vi.useRealTimers());
});
