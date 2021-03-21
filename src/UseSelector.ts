import React from "react";

import { contextMap } from "./GlobalState";
import { Context, ContextData } from "./Types";

export function useSelector<T, G>(context: Context<T>, selector: (value: T) => G): G {
    const contextData: ContextData<T> = contextMap.get(context)!;
    const selectedValue = React.useMemo(() => selector(contextData.value), []);
    const [value, setValue] = React.useState(selectedValue);

    React.useEffect(() => {
        const subscription = {
            selector,
            selectedValue,
            setValue,
        };

        contextData.subscriptions.add(subscription);

        return () => {
            contextData.subscriptions.delete(subscription);
        };
    }, []);

    return value;
}
