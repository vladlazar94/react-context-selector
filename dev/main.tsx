import React from "react";
import ReactDOM from "react-dom";

import { createContext } from "../src/main";

const initialState = {
    contributor: {
        personalInfo: {
            name: "Derp",
            email: "derp@derp.com",
        },
        insights: {
            mostUsedLanguage: "TypeScript",
        },
    },
};

const [useNotifier, useSelector] = createContext(initialState);

export function App() {
    const [state, setState] = React.useState(initialState);

    useNotifier(state);

    const updateMostUsedLanguage = React.useCallback(
        (mostUsedLanguage: string) =>
            setState({
                ...state,
                contributor: {
                    ...state.contributor,
                    insights: { ...state.contributor.insights, mostUsedLanguage },
                },
            }),
        []
    );

    return <Page updateMostUsedLanguage={updateMostUsedLanguage} />;
}

function PersonalInfo() {
    const name = useSelector(state => state.contributor.personalInfo.name);
    const email = useSelector(state => state.contributor.personalInfo.email);

    return (
        <ul>
            <strong>{"Personal Info"}</strong>
            <li>
                <em>{`Name: ${name}`}</em>
            </li>
            <li>
                <em>{`Email: ${email}`}</em>
            </li>
        </ul>
    );
}

function Insights(props: any) {
    const mostUsedLanguage = useSelector(state => state.contributor.insights.mostUsedLanguage);

    const [showInput, setShowInput] = React.useState(false);
    const toggle = () => setShowInput(!showInput);

    const editBtn = !showInput && <button onClick={toggle}>{"Edit"}</button>;
    const okBtn = showInput && <button onClick={toggle}>{"Ok"}</button>;
    const input = showInput && (
        <input
            value={mostUsedLanguage}
            onChange={e => props.updateMostUsedLanguage(e.target.value)}
        />
    );

    return (
        <ul>
            <strong>{"Insights"}</strong>
            <li>
                <em>{`Most used language: ${mostUsedLanguage}`}</em>
                {input}
                {editBtn}
                {okBtn}
            </li>
        </ul>
    );
}

const Page = React.memo(function Page(props: any) {
    return (
        <>
            <h2>{"GitHub Profile"}</h2>
            <PersonalInfo />
            <Insights {...props} />
        </>
    );
});

ReactDOM.render(<App />, document.getElementById("react-root"));
