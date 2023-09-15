import type { Component } from 'solid-js';
import { createSignal, Switch, Match } from 'solid-js';
import _ from 'underscore';

import StepwiseSort, {
  SortState,
  SortStateKind,
  ComparisonNeeded,
  Sorted
} from './stepwise-sort';

import css from './Tests.module.css';


type Props = {
  choices: string[];
  onTested(order: string[]): void;
  onReset(): void;
};


function useStepwiseSort(
  props: Props,
  sort: StepwiseSort<string>,
  firstComparison: [string, string]
): [
  () => [string, string],
  (choice: string, alternative: string) => void
] {
  const [comparison, setComparison] = createSignal(firstComparison);
  const choose = (choice: string, alternative: string) => {
    sort.setOrder(choice, alternative);
    const next = sort.next();
    switch (next.kind) {
      case SortStateKind.Sorted:
        props.onTested(next.sortedList);
        break;
      case SortStateKind.ComparisonNeeded:
        setComparison(next.elements);
        break;
    }
  };
  return [comparison, choose];
};


const Tests: Component<Props> = (props) => {
  const sort = new StepwiseSort<string>(_.shuffle(props.choices));

  return (
    <Switch>
      <Match when={sort.next().kind === SortStateKind.Sorted}>
        {(() => {
          props.onTested((sort.next() as Sorted<string>).sortedList);
          return <p>Done ordering! (This shouldn't happen)</p>;
        })()}
      </Match>
      <Match when={sort.next().kind === SortStateKind.ComparisonNeeded}>
        {(() => {
          const firstComparison = (sort.next() as ComparisonNeeded<string>).elements;
          const [comparison, choose] = useStepwiseSort(props, sort, firstComparison);
          const [element1, element2] = comparison();
          return (
            <div>
              <button onClick={() => choose(element1, element2)}>
                {element1}
              </button>
              <button onClick={() => choose(element2, element1)}>
                {element2}
              </button>
            </div>
          );
        })()}
      </Match>
    </Switch>
  );
};

export default Tests;
