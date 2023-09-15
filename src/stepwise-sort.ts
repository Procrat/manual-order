import TupleMap from './tuple-map';


enum Order {
  LessThan = -1,
  Equal = 0,
  GreaterThan = 1,
}


export enum SortStateKind {
  Sorted,
  ComparisonNeeded,
}

export type Sorted<T> = {
  kind: SortStateKind.Sorted;
  sortedList: T[];
};

export type ComparisonNeeded<T> = {
  kind: SortStateKind.ComparisonNeeded;
  elements: [T, T];
};

export type SortState<T> = Sorted<T> | ComparisonNeeded<T>;


class StepwiseSort<T> {
  elements: T[];
  pastComparisons: TupleMap<T, Order>;

  constructor(elements: T[]) {
    this.elements = elements;
    this.pastComparisons = new TupleMap();
  }

  next(): SortState<T> {
    try {
      this.elements.sort((a, b) => this.compare(a, b));
      return {
        kind: SortStateKind.Sorted,
        sortedList: this.elements,
      }
    } catch (comparisonNeededOrException) {
      if ((<ComparisonNeeded<T>>comparisonNeededOrException).kind === SortStateKind.ComparisonNeeded) {
        return <ComparisonNeeded<T>>comparisonNeededOrException;
      } else {
        throw comparisonNeededOrException;
      }
    }
  }

  setOrder(element1: T, element2: T): void {
    this.pastComparisons.set([element1, element2], Order.LessThan);
    this.pastComparisons.set([element2, element1], Order.GreaterThan);
  }

  compare(a: T, b: T): Order {
    if (a === b) {
      return Order.Equal;
    }
    const pastComparison = this.pastComparisons.get([a, b]);
    if (pastComparison !== undefined) {
      return pastComparison;
    } else {
      throw {
        kind: SortStateKind.ComparisonNeeded,
        elements: [a, b],
      };
    }
  }
}

export default StepwiseSort;
