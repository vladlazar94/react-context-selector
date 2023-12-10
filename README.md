# Create your own React Context

React’s [Context](https://reactjs.org/docs/context.html) API allows us to arbitrarily skip levels of the component tree when passing data from ancestors to descendants. It comes in handy when working with stateful data that is read from by unrelated components at distant levels in the hierarchy. It’s also the backbone of [compound components](https://dev.to/alexi_be3/react-component-patterns-49ho), the powerful composition pattern behind [React Router](https://reactrouter.com/).

The Context API has been since its introduction at the core of almost every discussion around centralized state management. Although not a complete state management tool in itself, it can be used in conjunction with other React primitives to create a lightweight vanilla alternative to established solutions like  [Flux](https://facebook.github.io/flux/),  [React Redux](https://react-redux.js.org/)  or  [MobX React](https://github.com/mobxjs/mobx/tree/main/packages/mobx-react).

One of the most commonly recurring questions about using the Context API to make the central application state available to the component tree is about performance. What renders when? Does subscribing to a context trigger unnecessary updates of components that only read a sub-part of it? Should React components be  [memoized](https://reactjs.org/docs/react-api.html#reactmemo)  by default in the future?

The opinions in the community wildly diverge on this topic. Some advocate for the use of APIs such as  [connect](https://react-redux.js.org/api/connect)  to encapsulate the logic of rendering optimization. Some argue that we shouldn’t obsess about components re-rendering all the time, but to focus instead on keeping their rendering logic simple and lean. Some argue that mastering the basics of good component design yields solid alternatives to centralized state management ([great article on that](https://kentcdodds.com/blog/application-state-management-with-react)). There are good points on every side.

I don’t mean to endorse any one particular world view, but to help you navigate the complexity of solutions to the  [prop drilling](https://kentcdodds.com/blog/prop-drilling)  problem. In this article, we are going to go through a step by step implementtation of our own Context API.

## The API

An example of a lightweight application making use of centralized state can choose to provide both the latest state as well as the means to update it through context. The current context creation API returns a  [Provider](https://reactjs.org/docs/context.html#contextprovider)  wrapper component, and the state-of-the-art way to access the context value is through the  [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext)  hook.

```jsx
import { createContext, useContext, useReducer } from "react";

const StateContext = createContext(initialState);  
const DispatchContext = createContext(noop);

function App() {  
    const [state, dispatch] = useReducer(reducer, initialState); 
    return (
        <StateContext.Provider value={state}>  
            <DispatchContext.Provider value={dispatch}>  
                <Component />  
            <DispatchContext.Provider>  
        </StateContext.Provider>  
    );
}

function Component() {  
    const dispatch = useContext(DispatchContext);  
    const bar = useContext(StateContext).foo.bar; // ...  
}
```

The Provider originates from a time when lifecycle logic could only be implemented within  [class components](https://reactjs.org/docs/react-component.html). With the introduction of hooks, we now have the possibility to explore an API which allows applications that make use of multiple contexts to grow free of deeply nested pyramids of  [Providers](https://reactjs.org/docs/context.html#contextprovider).

Another interesting twist worth adding to the story is the use of selectors in order to access context data, as popularized by  [React Redux](https://react-redux.js.org/). We will include our own implementation of  [useSelector](https://react-redux.js.org/api/hooks#useselector)  into the API and explore its benefits.

```jsx
import { useReducer } from "react";  
import { createContext } from "..."; 

const [useProvider, useSelector] = createContext(initialState);  
const [useDispatchProvider, useDispatch] = createContext(noop);

function App() {  
    const [state, dispatch] = useReducer(reducer, initialState); 

    useProvider(state);  
    useDispatchProvider(dispatch); 

    return <Component />;  
}

function Component() {  
    const dispatch = useDispatch();  
    const bar = useSelector(state => state.foo.bar); // ...  
}
```

## Step I: Setting the Scene

The introduction of React  [hooks](https://reactjs.org/docs/hooks-intro.html)  has rendered the use of  [higher order components](https://reactjs.org/docs/higher-order-components.html)  as well as  [mixins](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)  obsolete. This has left a nostalgic void in the arcane realm of higher order things. We can try to fill that void by once in a while creating a higher order hook.

Creating a context is equivalent to creating a pair of hooks that unambiguously correspond to each other. We can leverage this design to establish connections between components at distant levels of the hierarchy without passing props.

```jsx
export function createContext(initialValue) {  
    const useProvider = createProviderHook();  
    const useSelector = createSelectorHook(); 
    return [useProvider, useSelector];
}

function createProviderHook() {  
    return function(value) {
        // ?  
    } 
}

function createSelectorHook() {  
    return function(select) {  
        // ?  
    }
}
```

## Step II: Sharing the Context

The pairwise creation of the hooks is a good opportunity to also create the context object through which they share data. While useProvider continously writes the latest received value to the context, useSelector continuously reads the latest value from it.

Note that even if the latest context value is shared by the two hooks, it is not done so reactively. An update of the component calling useProvider does not necessarily trigger an update of all descendants that call useSelector.  [Memoized](https://reactjs.org/docs/react-api.html#reactmemo)  components might exist in between.

```jsx
export function createContext(initialValue) {  
    const context = { value: initialValue };
    const useProvider = createProviderHook(context);
    const useSelector = createSelectorHook(context);
    return [useProvider, useSelector];
}

function createProviderHook(context) {  
    return function(value) {
        context.value = value;
    }
}

function createSelectorHook(context) {  
    return function(select) {
        return select(context.value);
    }
}
```

## Step III: Registering Subscriptions

We now need to make sure that when useProvider receives a new value, all components that call useSelector are updated.

The idea is for each instance of useSelector to introduce itself as a subscriber to the context, and for useProvider to notify all registered subscriptions upon receiving a new value. With this addition, our implementation of the Context API will work correctly under the use of  [memoized components](https://reactjs.org/docs/react-api.html#reactmemo)  as well.

```jsx
import { useEffect, useReducer, useMemo } from "react";

export function createContext(initialValue) {
    const context = {
        value: initialValue,
        subscriptions: new Set();
    }; 
    const useProvider = createProviderHook(context);
    const useSelector = createSelectorHook(context);
    return [useProvider, useSelector];  
}

function createProviderHook(context) {  
    return function(value) {  
        context.value = value;
        useEffect(() => {
            for (const notifyUpdate of context.subscriptions) notifyUpdate();
        }, [value]);
    }  
}

function createSelectorHook(context) {
    return function(select) {
        const selectedValue = select(context.value);
        const notifyUpdate = useReducer(c => c + 1, 0)[1];
        const subscription = useMemo(() => notifyUpdate), []);
        useEffect(() => {
            context.subscriptions.add(subscription);
            return () => context.subscriptions.delete(subscription);
        }, []);
        return selectedValue;
    }  
}
```

## Step IV: Fixing the Flickering UI

Let’s take a look at an interesting thing that happens if we  [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)  to notify the registered subscriptions.

The component calling useProvider udates, scheduling the notification of all subscriptions to happen after the changes are commited to the DOM and the browser has re-painted. If all context consumers are updated synchronously as a consequence of the provider ancestor updating, then it’s all fine, by the time the notification effect runs, all subscriptions will have received the latest context value, leaving no updates to be triggered.

But what if there’s a  [memoized component](https://reactjs.org/docs/react-api.html#reactmemo)  in between, and at least one consumer doesn’t immediately update as a result of the provider ancestor updating? Then, after the browser paints the initial update and the notification effect runs, the consumers that haven’t received the latest context value are notified and update, determining the browser to re-paint.

Yes, in the presence of memozied components, it might take at least two re-paints to show the updated component tree when the context value changes. This can produce a flicker effect in the UI.

And that’s why we’re going to  [useLayoutEffect](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)  instead.

Its callback is guaranteed to run after the render changes are commited to the DOM, but  _before_  the browser has had the chance to re-paint. Not only that, but further state updates triggered inside the layout effect are also guaranteed to be applied synchronously and commited to the DOM before the browser re-paint, which means that both the update of the provider ancestor as well as the updates of consumer descendants are presented to the user all at once.

Note that this is not necessarily a good thing. It’s simply a design decision. Updating the component tree synchronously in one go also means that the browser is blocked on rendering for longer. Exploring this distinction further naturally leads to  [concurrent mode](https://reactjs.org/docs/concurrent-mode-intro.html), which I do not feel ready to talk about at this point, at least until it become stable.

```jsx
import { useLayoutEffect } from "react";

function createProviderHook(context) {
    return function(value) {
        context.value = value;
        useLayoutEffect(() => {
            for (const notifyUpdate of context.subscriptions) notifyUpdate();
        }, [value]);
    }
}
```

Those of you that have a taste for the exotic might ask, but what about synchronously notifying the subscriptions already in the render phase? If you know what you’re doing, it’s nothing but using  [the functional equivalent of getDerivedStateFromProps](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops). Exotic indeed, a lot less documented and a lot more difficult to explain. I’m going to leave it aside for now.

By the way, if you haven’t yet, make sure to set some time aside and read  [the complete guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/). I always find it refreshing.

## Step V: Updating from Top to Bottom

Things went smooth so far. Every step along the way was logical and somewhat clear. But those of you that have listened to the ghost stories of React might remember the spectre of React Redux,  [stale props and zombie children](https://react-redux.js.org/api/hooks#stale-props-and-zombie-children).

**(ノಠ益ಠ)ノ彡┻━┻**

[This amazing article](https://kaihao.dev/posts/Stale-props-and-zombie-children-in-Redux)  already does exceptional work exploring the intricacies of the problem. If you are new to it, I encourage you not to feel overwhelmed with the amounting complexity at this point, but to take your time and master the basics first.

To be as brief as possible, our implementation does not suffer from zombie children. Let’s solve the stale props issue by enforcing the batched, top to bottom notification of registered subscriptions. The best tool we have at hand so far is a hidden feature of  [ReactDOM](https://reactjs.org/docs/react-dom.html), documented in user land folklore.

```jsx
import { unstable_batchedUpdates } from "react-dom";

function createProviderHook(context) {
    return function(value) {
        context.value = value;
        useLayoutEffect(() => {
            unstable_batchedUpdates(() => {
                for (constnotifyUpdate of context.subscriptions) notifyUpdate();
            });
        }, [value]);
    }
}
```

## Step VI: Avoiding Unnecessary Updates

We haven’t leveraged the selector-based interface yet. So far, every registered subscription of useSelector is notified when the context value changes, even if the selected value stays the same. Our aim is to only trigger an update of the elements for which the selector callback returns a different value when called on the new context.

Note that there is a subtle distinction between  **to only trigger an update of the elements**  and  **to only update the elements**. The latter implies that using this API optimizes by itself the rendering of components. This is not the case. For there to be a performance improvement, there must also be  [memoized components](https://reactjs.org/docs/react-api.html#reactmemo)  between the provider ancestor and the consumer descendants. By default, React updates all descendants of an updating element, no matter if their props change or not. Here’s  [a (mostly) complete guide to React rendering behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/).

The idea is to share the latest selector as well as the latest selected value with useProvider, every time useSelector runs. These can be used by useProvider to opt out of notifying subscriptions that wouldn’t receive a selected value different from the previous one.

```jsx
function createProviderHook(context) {
    return function(value) {
        context.value = value;
        useLayoutEffect(() => {
			unstable_batchedUpdates(() => {
                for (const {
                    select,
                    selectedValue,
                    notifyUpdate
                } of context.subscriptions) {
                    if (select(value) !== selectedValue) notifyUpdate();
                }
            });
        }, [value]);
    }
}

function createSelectorHook(context) {
    return function(select) {
        const selectedValue = select(context.value);
        const notifyUpdate = useReducer(c => c + 1, 0)[1];
        const subscription = useMemo(() => ({
            select,
            selectedValue,
            notifyUpdate,
        }), []);

        subscription.select = select;
        subscription.selectedValue = selectedValue;
        
        useEffect(() => {
            context.subscriptions.add(subscription);
            return () => context.subscriptions.delete(subscription);
        }, []);

        return selectedValue;
    }
}
```

## Step VII: Completing the API

Whew, that was a lot to digest, but we’re almost there! We are missing two minor details to complete the API. We can provide useSelector with a default callback, allowing it to be called without arguments. We can also let the users decide what it means for two context values to be equal, through a second equality checker callback. These features are not strictly necessariy the API, but they do nevertheless make an important difference to the API users in practice.

```jsx
function createSelectorHook(context) {
    return function(select = identity, areEqual = strictEquality) {
          // This margin is too narrow to contain it.
    }
}

function identity(value) {
    return value;
}

function strictEquality(left, right) {
    return left === right;
}
```

## Conclusion

We have implemented a Context API using three primitive abilities provided by React: The ability to persist arbitrary data throughout the entire lifecycle of a component ([useMemo](https://reactjs.org/docs/hooks-reference.html#usememo)  or  [useRef](https://reactjs.org/docs/hooks-reference.html#useref)), the ability to run arbitrary code when a component mounts, unmounts, or receives new data ([useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)  and  [useLayourEffect](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)), and the ability to arbitrarily trigger the update of any component ([useState](https://reactjs.org/docs/hooks-reference.html#usestate)  or  [useReducer](https://reactjs.org/docs/hooks-reference.html#usereducer)).

I hope that you have enjoyed reading this article and that it has inspired you to pursue your own experiments with reactivity. In a few years from now, we might look back at the current practices and render them unnecessarily complicated. But before we can get there, we must continue to dig closer the bottom of things and ask,  _could this be made simpler?_

Thank you for your time and I wish you a great day! I will continue to test and to maintain the code in  [this repo](https://github.com/vladlazar94/react-context-selector).

**〆(・∀・)**
