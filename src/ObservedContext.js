import React, {useContext, useEffect, useState} from "react";
import {useFun} from "react-use-fun";

/**
 * subscribes to an observable context
 * @param fun is called once the observed context data changes
 * @param ObservedContext the context object to subscribe
 * @param id
 */
export function useObservedContext(fun, ObservedContext, id = crypto.randomUUID()) {
    const subscribe = useContext(ObservedContext)
    if (subscribe === undefined) {
        throw new Error('Context must be used within a provider or context is not observable')
    }
    useEffect(() => {
        return subscribe(fun, id)
    });
}

/**
 * initializes an observable
 * @param callback will be called once a new component subscribes to the context
 * @returns a React.state object with notify and subscribe functions: const [{notify, subscribe}]
 */
export function useObservable(callback){

    const [observable] = useState({subscribe, notify})

    const listeners = new Map()
    const onListenerAdded = useFun(callback)

    function subscribe(fun, id = crypto.randomUUID()){
        listeners.set(id, fun)
        onListenerAdded(id)
        return () => {
            listeners.delete(id)
        }
    }

    function notify(lState, id = null){
        if (id){
            listeners.get(id)(lState)
        }
        else{
            listeners.forEach(fun => fun(lState))
        }
    }

    return {subscribe: observable.subscribe, notify: observable.notify}
}


