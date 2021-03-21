import React from "react";
import ReactDOM from "react-dom";

import { createContext } from "../src/CreateContext";
import { useSelector } from "../src/UseSelector";

const initialState = {
    foo: "foo",
    bar: {
        baz: "baz",
    },
};

const useNotifier = createContext(initialState);

function App() {
    const [state, setState] = React.useState(initialState);
    const app = React.useMemo(() => <ContextConsumers />, []);

    useNotifier(state);

    return (
        <div>
            {app}
            <button onClick={() => setState({ ...state, foo: `${state.foo}o` })}>Change foo</button>
            <button
                onClick={() =>
                    setState({ ...state, bar: { ...state.bar, baz: `${state.bar.baz}z` } })
                }
            >
                Change baz
            </button>
        </div>
    );
}

function ContextConsumers() {
    const [show, setShow] = React.useState(true);

    return (
        <>
            <SomeComp />
            <SomeOtherComp />
            {show ? <SomeOptionalComp /> : null}
            <button onClick={() => setShow(!show)}>Show!</button>
        </>
    );
}

function SomeComp() {
    const foo = useSelector(useNotifier, c => c.foo);
    const baz = useSelector(useNotifier, c => c.bar.baz);

    return (
        <span>
            {foo}
            {baz}
        </span>
    );
}

function SomeOtherComp() {
    const baz = useSelector(useNotifier, c => c.bar.baz);

    return <span>{baz}</span>;
}

function SomeOptionalComp() {
    const foo = useSelector(useNotifier, c => c.foo);

    return <span>{foo}</span>;
}

ReactDOM.render(<App />, document.getElementById("react-root"));
