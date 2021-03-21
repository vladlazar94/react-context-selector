import React from "react";

type Notifier<T> = (value: T) => void;
type Selector<T, G> = (value: T) => G;

export function createContext<T>(value: T): [Notifier<T>, <G>(selector: Selector<T, G>) => G] {
    const contextData: ContextData<T> = { value, subscriptions: new Set() };

    const useNotifierHook = createUseNotifierHook(contextData);
    const useSelectorHook = createUseSelectorHook(contextData);

    return [useNotifierHook, useSelectorHook];
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

function createUseSelectorHook<T>(contextData: ContextData<T>) {
    return function <G>(selector: (value: T) => G) {
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
    };
}

export type ContextData<T> = {
    value: T;
    readonly subscriptions: Set<Subscription<any, any>>;
};

export type Subscription<T, G> = {
    selectedValue: G;
    selector: (value: T) => G;
    readonly notifyUpdate: () => void;
};
