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

const context = createContext(initialState);

function App() {
    const [state, setState] = React.useState(initialState);
    const app = React.useMemo(() => <ContextConsumers />, []);

    return (
        <context.Provider value={state}>
            {app}
            <button onClick={() => setState({ ...state, foo: `${state.foo}o` })}>Change foo</button>
            <button
                onClick={() =>
                    setState({ ...state, bar: { ...state.bar, baz: `${state.bar.baz}z` } })
                }
            >
                Change baz
            </button>
        </context.Provider>
    );
}

function ContextConsumers() {
    return (
        <>
            <SomeComp />
            <SomeOtherComp />
        </>
    );
}

function SomeComp() {
    const foo = useSelector(context, c => c.foo);
    const baz = useSelector(context, c => c.bar.baz);

    return (
        <span>
            {foo}
            {baz}
        </span>
    );
}

function SomeOtherComp() {
    const baz = useSelector(context, c => c.bar.baz);

    return <span>{baz}</span>;
}

ReactDOM.render(<App />, document.getElementById("react-root"));
