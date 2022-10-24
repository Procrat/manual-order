import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';


type Props = {
  onSubmit(choices: string[]): void;
}


const Inputs: Component<Props> = (props) => {
  const [choices, setChoices] = createSignal("");
  const submit = () => {
    const cleanedChoices = choices()
      .split("\n")
      .filter(choice => choice.length > 0);
    props.onSubmit(cleanedChoices);
  };

  return (
    <>
      <textarea
        value={choices()}
        onInput={(e) => setChoices((e.target as HTMLTextAreaElement).value)}
        placeholder="One line per option"
        rows="3"
      />
      <button onClick={submit}>Order us!</button>
    </>
  );
};

export default Inputs;
