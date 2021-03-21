import React from "react";
import ReactDOM from "react-dom";

import { createContext } from "../src/Hooks";

const initialState = {
    foo: "foo",
    bar: {
        baz: "baz",
    },
};

const [useNotifier, useSelector] = createContext(initialState);

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
    return (
        <ul>
            <li>
                <SomeComp />
            </li>
            <li>
                <SomeOtherComp />
            </li>
            <li>
                <SomeOptionalComp />
            </li>
        </ul>
    );
}

function SomeComp() {
    const foo = useSelector(c => c.foo);
    const baz = useSelector(c => c.bar.baz);

    return (
        <span>
            {foo}
            {baz}
        </span>
    );
}

function SomeOtherComp() {
    const [showFoo, setShowFoo] = React.useState(true);
    const selector = showFoo ? (c: any) => c.foo : (c: any) => c.bar.baz;
    const baz = useSelector(selector);

    return (
        <span>
            {baz}
            <button onClick={() => setShowFoo(!showFoo)}>Show foo or baz</button>
        </span>
    );
}

function SomeOptionalComp() {
    const [show, setShow] = React.useState(true);
    const foo = useSelector(c => c.foo);

    return (
        <span>
            {show ? foo : null}
            <button onClick={() => setShow(!show)}>Show!</button>
        </span>
    );
}

ReactDOM.render(<App />, document.getElementById("react-root"));
