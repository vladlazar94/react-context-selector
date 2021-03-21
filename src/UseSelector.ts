import React from "react";

import { contextMap } from "./GlobalState";
import { Context, ContextData } from "./Types";

export function useSelector<T, G>(context: Context<T>, selector: (value: T) => G): G {
    const contextData: ContextData<T> = contextMap.get(context)!;
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
