import React from "react";

import { contextMap } from "./GlobalState";
import { MutableValueWrapper, Subscription, ValueWrapper } from "./Types";

export function createContext<T>(value: T) {
    const subscriptions = new Set<Subscription<T, any>>();
    const wrapper = { value };
    const wrapperContext = React.createContext(wrapper);
    const Provider = createProvider(wrapper, wrapperContext, subscriptions);

    const context = { Provider };
    const contextData = { wrapperContext, subscriptions };

    contextMap.set(context, contextData);

    return context;
}

function createProvider<T>(
    wrapper: MutableValueWrapper<T>,
    wrapperContext: React.Context<MutableValueWrapper<T>>,
    subscriptions: Set<Subscription<T, any>>
): React.FunctionComponent<ValueWrapper<T>> {
    return function (props) {
        wrapper.value = props.value;

        React.useEffect(() => {
            for (const subscription of subscriptions) {
                const latestValue = subscription.selector(props.value);

                if (latestValue !== subscription.selectedValue) {
                    subscription.setValue(latestValue);
                    subscription.selectedValue = latestValue;
                }
            }
        }, [props.value]);

        return <wrapperContext.Provider value={wrapper}></wrapperContext.Provider>;
    };
}
