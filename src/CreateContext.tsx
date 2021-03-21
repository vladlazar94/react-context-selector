import React from "react";

import { contextMap, ContextData, Subscription } from "./GlobalState";

export function createContext<T>(value: T) {
    const subscriptions = new Set<Subscription<T, any>>();
    const contextData = { value, subscriptions };
    const useNotifierHook = createUseNotifierHook(contextData);

    contextMap.set(useNotifierHook, contextData);

    return useNotifierHook;
}

function createUseNotifierHook<T>(contextData: ContextData<T>) {
    return function (value: T) {
        contextData.value = value;

        React.useLayoutEffect(() => {
            for (const subscription of contextData.subscriptions) {
                const latestValue = subscription.selector(value);

                if (latestValue !== subscription.selectedValue) {
                    subscription.selectedValue = latestValue;
                    subscription.notifyUpdate();
                }
            }
        }, [value]);
    };
}
