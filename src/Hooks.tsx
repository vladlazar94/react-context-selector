import React from "react";

export function createContext<T>(value: T): [UseNotifier<T>, UseSelector<T>] {
    const contextData: ContextData<T> = { value, subscriptions: new Set() };
    const useNotifierHook = createUseNotifierHook(contextData);
    const useSelectorHook = createUseSelectorHook(contextData);

    return [useNotifierHook, useSelectorHook];
}

function createUseNotifierHook<T>(contextData: ContextData<T>) {
    return function (value: T) {
        contextData.value = value;

        React.useLayoutEffect(() => {
            for (const {
                areEqual,
                select,
                selectedValue,
                notifyUpdate,
            } of contextData.subscriptions) {
                if (!areEqual(select(value), selectedValue)) {
                    notifyUpdate();
                }
            }
        }, [value]);
    };
}

function createUseSelectorHook<T>(contextData: ContextData<T>) {
    return function <G>(select: (value: T) => G, areEqual?: EqualityFn<G>) {
        const selectedValue = select(contextData.value);
        const [, notifyUpdate] = React.useReducer(s => !s, true);
        const subscription = React.useMemo(
            () => ({
                select,
                selectedValue,
                notifyUpdate,
                areEqual: areEqual ?? referenceEquality,
            }),
            []
        );

        subscription.select = select;
        subscription.selectedValue = selectedValue;
        subscription.areEqual = areEqual ?? referenceEquality;

        React.useEffect(() => {
            contextData.subscriptions.add(subscription);

            return () => {
                contextData.subscriptions.delete(subscription);
            };
        }, []);

        return selectedValue;
    };
}

function referenceEquality<G>(left: G, right: G): boolean {
    return left === right;
}

type UseNotifier<T> = (value: T) => void;
type UseSelector<T> = <G>(selector: Selector<T, G>, areEqual?: EqualityFn<G>) => G;
type Selector<T, G> = (value: T) => G;
type EqualityFn<G> = (left: G, right: G) => boolean;
type ContextData<T> = {
    value: T;
    subscriptions: Set<Subscription<T, any>>;
};

type Subscription<T, G> = {
    selectedValue: G;
    select: Selector<T, G>;
    areEqual: EqualityFn<G>;
    notifyUpdate: () => void;
};
