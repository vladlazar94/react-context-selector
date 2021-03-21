import { ContextData } from "./Types";

export const contextMap = new Map<(value: any) => void, ContextData<any>>();
