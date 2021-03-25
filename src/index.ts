import { useEffect, useLayoutEffect, useMemo, useReducer } from "react";
import { unstable_batchedUpdates } from "react-dom";

export function createContext<T>(value: T): [UseProvider<T>, UseSelector<T>] {
    const context: Context<T> = { value, subscriptions: new Set() };

    const useProvider = createUseProviderHook(context);
    const useSelector = createUseSelectorHook(context);

    return [useProvider, useSelector];
}

function createUseProviderHook<T>(context: Context<T>): UseProvider<T> {
    return function (value) {
        context.value = value;

        useLayoutEffect(() => {
            unstable_batchedUpdates(() => {
                for (const {
                    areEqual,
                    select,
                    selectedValue,
                    notifyUpdate,
                } of context.subscriptions) {
                    if (!areEqual(select(value), selectedValue)) {
                        notifyUpdate();
                    }
                }
            });
        }, [value]);
    };
}

function createUseSelectorHook<T>(contextData: Context<T>): UseSelector<T> {
    return function (select = returnTheSameThing, areEqual = areEqualByReference) {
        const selectedValue = select(contextData.value);
        const notifyUpdate = useReducer(s => !s, true)[1];
        const subscription = useMemo(
            () => ({
                select,
                selectedValue,
                notifyUpdate,
                areEqual,
            }),
            []
        );

        subscription.select = select;
        subscription.selectedValue = selectedValue;
        subscription.areEqual = areEqual;

        useEffect(() => {
            contextData.subscriptions.add(subscription);
            return () => {
                contextData.subscriptions.delete(subscription);
            };
        }, []);

        return selectedValue;
    };
}

function areEqualByReference<G>(left: G, right: G): boolean {
    return left === right;
}

function returnTheSameThing<T>(value: T): T {
    return value;
}

type UseProvider<T> = (value: T) => void;
type UseSelector<T> = <G = T>(
    selector?: (value: T) => G,
    areEqual?: (left: G, right: G) => boolean
) => G;

type Context<T> = {
    value: T;
    subscriptions: Set<Subscription<T, any>>;
};

type Subscription<T, G> = {
    selectedValue: G;
    select: (value: T) => G;
    areEqual: (left: G, right: G) => boolean;
    notifyUpdate: () => void;
};
