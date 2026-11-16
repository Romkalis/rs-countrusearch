import { describe, expect, it } from 'vitest';
import { createSearchHistory } from '../lib/searchHistory.js';
import type { HistoryStorage } from '../lib/searchHistory.js';

function memoryStorage(initial: Record<string, string> = {}): HistoryStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

describe('createSearchHistory', () => {
  it('starts empty', () => {
    expect(createSearchHistory(memoryStorage()).getAll()).toEqual([]);
  });

  it('puts the latest query first', () => {
    const history = createSearchHistory(memoryStorage());

    history.add('ukraine');
    history.add('poland');

    expect(history.getAll()).toEqual(['poland', 'ukraine']);
  });

  it('moves a repeated query to the top without duplicates, ignoring case', () => {
    const history = createSearchHistory(memoryStorage());

    history.add('ukraine');
    history.add('poland');
    history.add('Ukraine');

    expect(history.getAll()).toEqual(['Ukraine', 'poland']);
  });

  it('ignores blank queries and trims the rest', () => {
    const history = createSearchHistory(memoryStorage());

    history.add('   ');
    history.add('  japan ');

    expect(history.getAll()).toEqual(['japan']);
  });

  it('keeps only the configured number of entries', () => {
    const history = createSearchHistory(memoryStorage(), 'key', 2);

    history.add('a');
    history.add('b');
    history.add('c');

    expect(history.getAll()).toEqual(['c', 'b']);
  });

  it('persists entries in storage between instances', () => {
    const storage = memoryStorage();

    createSearchHistory(storage, 'key').add('japan');

    expect(createSearchHistory(storage, 'key').getAll()).toEqual(['japan']);
  });

  it('survives corrupted storage data', () => {
    const storage = memoryStorage({ key: '{not json' });

    expect(createSearchHistory(storage, 'key').getAll()).toEqual([]);
  });

  it('survives a storage that throws', () => {
    const storage: HistoryStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const history = createSearchHistory(storage);

    expect(() => history.add('japan')).not.toThrow();
    expect(history.getAll()).toEqual(['japan']);
  });
});
