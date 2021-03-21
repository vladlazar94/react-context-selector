import React from "react";

import { contextMap } from "./GlobalState";
import { ContextData, Subscription, ValueWrapper } from "./Types";

export function createContext<T>(value: T) {
    const subscriptions = new Set<Subscription<T, any>>();
    const contextData = { value, subscriptions };
    const Provider = createProvider(contextData);
    const context = { Provider };

    contextMap.set(context, contextData);

    return context;
}

function createProvider<T>(
    contextData: ContextData<T>
): React.FunctionComponent<React.PropsWithChildren<ValueWrapper<T>>> {
    return function (props) {
        contextData.value = props.value;

        React.useEffect(() => {
            for (const subscription of contextData.subscriptions) {
                const latestValue = subscription.selector(props.value);

                if (latestValue !== subscription.selectedValue) {
                    subscription.selectedValue = latestValue;
                    subscription.notifyUpdate();
                }
            }
        }, [props.value]);

        return <>{props.children}</>;
    };
}
