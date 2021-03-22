# React Context Selector

## The current vanilla React context experience:

```jsx
import React, { createContext, useContext, useReducer } from "react";

const StateContext = createContext(initialState);
const DispatchContext = createContext(reducer);
const ThemeContext = createContext(lightTheme);

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <ThemeContext.Provider value={lightTheme}>
            <StateContext.Provider value={state}>
                <DispatchContext.Provider value={dispatch}>
                    <Consumer />
                </DispatchContext.Provider>
            </StateContext.Provider>
        </ThemeContext.Provider>
    );
}

function Consumer() {
    const dispatch = useContext(DispatchContext);
    const state = useContext(StateContext);
    const bg = useContext(ThemeContext).colors.bg;

    // return ...
}
```

## Using an alternative approach:

```jsx
import React, { useReducer } from "react";
import { createContext } from "react-context-selector";

const [useStateProvider, useStateSelector] = createContext(initialState);
const [useDispatchProvider, useDispatch] = createContext(reducer);
const [useThemeProvider, useTheme] = createContext(lightTheme);

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useStateProvider(state);
    useDispatchProvider(dispatch);
    useThemeProvider(lightTheme);

    return <Consumer />;
}

function Consumer() {
    const dispatch = useDispatch();
    const state = useStateSelector(state => state.foo.bar);
    const bg = useTheme(theme => theme.colors.bg);

    // return ...
}
```

## Advantages:

1. The providers stack linearly on top of each other, avoiding a deeply nested provider pyramid.
2. The selector hooks will only force a component update if the selected value has changed.
