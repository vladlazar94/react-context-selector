import React from "react";

import { contextMap } from "./GlobalState";
import { ContextData, Subscription } from "./Types";

export function createContext<T>(value: T) {
    const subscriptions = new Set<Subscription<T, any>>();
    const contextData = { value, subscriptions };
    const hook = createUseNotifierHook(contextData);

    contextMap.set(hook, contextData);

    return hook;
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
