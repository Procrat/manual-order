import { describe, expect, test } from 'vitest';

import StepwiseSort, { SortStateKind } from '../src/stepwise-sort';

type InteractionResult<T> = {
  sortedList: T[];
  comparisons: [T, T][];
};

function interact<T>(unsortedList: T[]): InteractionResult<T> {
  const sort = new StepwiseSort(unsortedList);
  const comparisons = [];
  while (true) {
    const state = sort.next();
    switch (state.kind) {
      case SortStateKind.ComparisonNeeded:
        comparisons.push(state.elements);
        if (state.elements[0] < state.elements[1]) {
          sort.setOrder(state.elements[0], state.elements[1]);
        } else {
          sort.setOrder(state.elements[1], state.elements[0]);
        }
        break;
      case SortStateKind.Sorted:
        // Check idempotency
        expect(sort.next()).toEqual({
          kind: SortStateKind.Sorted,
          sortedList: state.sortedList,
        });
        return {
          sortedList: state.sortedList,
          comparisons
        };
    }
  }
}

describe.concurrent('stepwise-sort', () => {
  test.concurrent('should leave empty list intact', () => {
    const { sortedList, comparisons } = interact([]);
    expect(sortedList).toEqual([]);
    expect(comparisons).toEqual([]);
  });

  test.concurrent('should leave singleton list intact', () => {
    const { sortedList, comparisons } = interact(['a']);
    expect(sortedList).toEqual(['a']);
    expect(comparisons).toEqual([]);
  });

  test.concurrent('should leave sorted pair intact', () => {
    const { sortedList, comparisons } = interact(['a', 'b']);
    expect(sortedList).toEqual(['a', 'b']);
    expect(comparisons).toEqual([
      ['a', 'b'],
    ]);
  });

  test.concurrent('should sort unsorted pair', () => {
    const { sortedList, comparisons } = interact(['b', 'a']);
    expect(sortedList).toEqual(['a', 'b']);
    expect(comparisons).toEqual([
      ['b', 'a'],
    ]);
  });

  test.concurrent('should leave sorted list intact', () => {
    const { sortedList, comparisons } = interact(['a', 'b', 'c', 'd']);
    expect(sortedList).toEqual(['a', 'b', 'c', 'd']);
    expect(comparisons).toEqual([
      ['b', 'd'],
      ['c', 'd'],
      ['a', 'b'],
      ['c', 'b'],
      ['a', 'c'],
    ]);
  });

  test.concurrent('should sort unsorted list', () => {
    const { sortedList, comparisons } = interact(['c', 'd', 'b', 'a']);
    expect(sortedList).toEqual(['a', 'b', 'c', 'd']);
    expect(comparisons).toEqual([
      ['d', 'a'],
      ['b', 'd'],
      ['c', 'a'],
      ['c', 'd'],
      ['b', 'c'],
      ['b', 'a'],
    ]);
  });

  test.concurrent('should sort large list', () => {
    const { sortedList, comparisons } = interact([9, 4, 7, 2, 5, 6, 3, 1, 0, 8]);
    expect(sortedList).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(comparisons.length).toEqual(23);
  });
});
