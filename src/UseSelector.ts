import React from "react";

import { contextMap } from "./GlobalState";
import { ContextData } from "./Types";

export function useSelector<T, G>(
    useNotifierHook: (value: T) => void,
    selector: (value: T) => G
): G {
    const contextData: ContextData<T> = contextMap.get(useNotifierHook)!;
    const selectedValue = selector(contextData.value);
    const [, notifyUpdate] = React.useReducer(s => !s, true);

    React.useEffect(() => {
        const subscription = {
            selector,
            selectedValue,
            notifyUpdate,
        };

        contextData.subscriptions.add(subscription);

        return () => {
            contextData.subscriptions.delete(subscription);
        };
    }, []);

    return selectedValue;
}
