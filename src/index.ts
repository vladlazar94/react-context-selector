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
    return function (select = identity, areEqual = areEqualByReference) {
        const selectedValue = select(contextData.value);

        const [, notifyUpdate] = useReducer(s => !s, true);
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

function identity<T>(value: T): T {
    return value;
}

type UseProvider<T> = (value: T) => void;
type UseSelector<T> = <G = T>(selector?: Selector<T, G>, areEqual?: EqualityFn<G>) => G;
type Selector<T, G> = (value: T) => G;
type EqualityFn<G> = (left: G, right: G) => boolean;

type Context<T> = {
    value: T;
    subscriptions: Set<Subscription<T, any>>;
};

type Subscription<T, G> = {
    selectedValue: G;
    select: Selector<T, G>;
    areEqual: EqualityFn<G>;
    notifyUpdate: () => void;
};
