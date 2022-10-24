// We're implementing the testing through heapsort. This implementation of
// heapsort is sort of turned inside out because we need to stop the algorithm
// whenever a comparison is needed. To minimise the number of comparisons, we
// use heapsort with bounce a.k.a. bottom-up heapsort.

import { ok, err, Result } from './result';
import TupleMap from './tuple-map';


class Node {
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  parent(): Node {
    return new Node(Math.floor((this.index - 1) / 2));
  }

  leftChild(): Node {
    return new Node(2 * this.index + 1);
  }

  rightChild(): Node {
    return new Node(2 * this.index + 2);
  }

  // Previous node in the array, not in the tree
  previous(): Node {
    return new Node(this.index - 1);
  }

  equals(other: Node): boolean {
    return this.index === other.index;
  }
}


enum Order {
  LessThan,
  Equal,
  GreaterThan,
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

class StepwiseHeapsort<T> {
  elements: T[];
  heapSize: number;
  initialSorting: boolean;
  nodeToSort: Node | undefined;
  pastComparisons: TupleMap<T, Order>;

  constructor(elements: T[]) {
    this.elements = elements;
    this.heapSize = elements.length;
    this.initialSorting = true;
    this.nodeToSort = new Node(this.heapSize - 1).parent();
    if (this.nodeToSort.index < 0) {
      this.nodeToSort = undefined;
    }
    this.pastComparisons = new TupleMap();
  }

  next(): SortState<T> {
    while (true) {
      if (this.heapSize == 0) {
        return {
            kind: SortStateKind.Sorted,
            sortedList: this.elements,
        };
      } else if (this.nodeToSort !== undefined) {
        if (this.initialSorting) {
          // This is the initial heapify
          const maybeComparisonNeeded = this.siftDown(this.nodeToSort);
          if (maybeComparisonNeeded.isErr) {
            return maybeComparisonNeeded.error;
          } else {
            if (this.nodeToSort.index == 0) {
              this.initialSorting = false;
              this.nodeToSort = undefined;
            } else {
              this.nodeToSort = this.nodeToSort.previous();
            }
          }
        } else {
          const maybeComparisonNeeded = this.siftDown(this.nodeToSort);
          if (maybeComparisonNeeded.isErr) {
            return maybeComparisonNeeded.error;
          } else {
            this.nodeToSort = undefined;
          }
        }
      } else {
        this.swap(new Node(0), new Node(this.heapSize - 1));
        this.heapSize -= 1;
        this.nodeToSort = new Node(0);
      }
    }
  }

  setOrder(element1: T, element2: T): void {
    this.pastComparisons.set([element1, element2], Order.LessThan);
    this.pastComparisons.set([element2, element1], Order.GreaterThan);
  }

  siftDown(node: Node): Result<undefined, ComparisonNeeded<T>> {
    const leafOrComparisonNeeded = this.leafSearch(node);
    if (leafOrComparisonNeeded.isErr) {
      return leafOrComparisonNeeded;
    }
    let leaf = leafOrComparisonNeeded.value;
    while (true) {
      const orderOrComparisonNeeded = this.compare(node, leaf);
      if (orderOrComparisonNeeded.isErr) {
        return orderOrComparisonNeeded;
      } else if (orderOrComparisonNeeded.value === Order.Equal) {
        return ok(undefined);
      } else if (orderOrComparisonNeeded.value === Order.GreaterThan) {
        leaf = leaf.parent();
      } else {
        break;
      }
    }
    let x = this.get(leaf);
    this.set(leaf, this.get(node));
    while (leaf.index > node.index) {
      const tmp = x;
      x = this.get(leaf.parent());
      this.set(leaf.parent(), tmp);
      leaf = leaf.parent();
    }
    return ok(undefined);
  }

  leafSearch(start: Node): Result<Node, ComparisonNeeded<T>> {
    let node = start;
    while (node.rightChild().index < this.heapSize) {
      // Determine which of node's two children is the greater
      const orderOrComparisonNeeded = this.compare(node.rightChild(), node.leftChild());
      if (orderOrComparisonNeeded.isErr) {
        return orderOrComparisonNeeded;
      } else if (orderOrComparisonNeeded.value === Order.GreaterThan) {
        node = node.rightChild()
      } else {
        node = node.leftChild()
      }
    }
    // At the last level, there might be only one child
    if (node.leftChild().index < this.heapSize) {
        node = node.leftChild()
    }
    return ok(node);
  }

  compare(node1: Node, node2: Node): Result<Order, ComparisonNeeded<T>> {
    if (node1.equals(node2)) {
      return ok(Order.Equal);
    }
    const pair: [T, T] = [this.get(node1), this.get(node2)];
    const pastComparison = this.pastComparisons.get(pair);
    if (pastComparison !== undefined) {
      return ok(pastComparison);
    } else {
      return err({
        kind: SortStateKind.ComparisonNeeded,
        elements: pair,
      });
    }
  }

  get(node: Node): T {
    return this.elements[node.index];
  }

  set(node: Node, value: T): void {
    this.elements[node.index] = value;
  }

  swap(node1: Node, node2: Node): void {
    [
      this.elements[node1.index],
      this.elements[node2.index],
    ] = [
      this.elements[node2.index],
      this.elements[node1.index],
    ];
  }
}

export default StepwiseHeapsort;
