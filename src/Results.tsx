import type { Component } from 'solid-js';
import { For } from 'solid-js';


type Props = {
  list: string[];
  onReset(): void;
};


const Results: Component<Props> = (props) => {
  return (
    <div>
      <ol>
        <For each={props.list}>{(item) =>
          <li>{item}</li>
        }</For>
      </ol>
      <button onClick={props.onReset}>Back</button>
    </div>
  );
};

export default Results;
