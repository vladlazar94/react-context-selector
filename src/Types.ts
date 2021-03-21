export type ContextMap = Map<Context<any>, ContextData<any>>;

export type Context<T> = {
    readonly Provider: Provider<T>;
};

export type Provider<T> = React.FunctionComponent<{
    readonly value: T;
}>;

export type ContextData<T> = {
    value: T;
    readonly subscriptions: Set<Subscription<any, any>>;
};

export type Subscription<T, G> = {
    selectedValue: G;
    selector: (value: T) => G;
    readonly setValue: (value: G) => void;
};

export type ValueWrapper<T> = {
    readonly value: T;
};
