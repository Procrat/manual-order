import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';

import Inputs from './Inputs';
import Results from './Results';
import Tests from './Tests';
import css from './App.module.css';


enum StateKind {
  RequestingInput,
  Testing,
  ShowingResults,
}

type RequestingInput = {
  kind: StateKind.RequestingInput;
};

type Testing = {
  kind: StateKind.Testing;
  choices: string[];
};

type ShowingResults = {
  kind: StateKind.ShowingResults;
  order: string[];
};

type State = RequestingInput | Testing | ShowingResults;


const App: Component = () => {
  const [state, setState] = createSignal<State>({ kind: StateKind.RequestingInput });
  const startTesting = (choices: string[]): void => {
    setState({ kind: StateKind.Testing, choices });
  };
  const showResults = (order: string[]): void => {
    setState({ kind: StateKind.ShowingResults, order });
  };
  const reset = (): void => {
    setState({ kind: StateKind.RequestingInput });
  };

  return (
    <div class={css.centered}>
      {(() => {
        const state_ = state();
        switch (state_.kind) {
          case StateKind.RequestingInput:
            return <Inputs onSubmit={startTesting} />;
          case StateKind.Testing:
            return (
              <Tests
                choices={state_.choices}
                onTested={showResults}
                onReset={reset}
              />
            );
          case StateKind.ShowingResults:
            return (
              <Results
                list={state_.order}
                onReset={reset}
              />
            );
        }
      })()}
    </div>
  );
};

export default App;
