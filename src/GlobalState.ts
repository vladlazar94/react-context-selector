export const contextMap = new Map<(value: any) => void, ContextData<any>>();

export type ContextData<T> = {
    value: T;
    readonly subscriptions: Set<Subscription<any, any>>;
};

export type Subscription<T, G> = {
    selectedValue: G;
    selector: (value: T) => G;
    readonly notifyUpdate: () => void;
};
