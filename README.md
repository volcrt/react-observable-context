# Introduction
Using observable context gives the decision whether to rerender or not to the children using the observable context

## Install

```sh
yarn add react-observable-context
# or
npm i react-observable-context --save
```

## Usage / Example - Observable Context Provider:
in this example we create a context to hold population numbers of a city.
It provides a method 'setPopulation' to change the population number for a city.
Once the population is being changed, all consumer are being notified about the changed populations.
It's up to the consumer to rerender or not

```javascript

export const ObservedPopulationsContext = React.createContext(null);

const PopulationsContext = React.createContext(null);

export function usePopulationContext() {
    const context = useContext(PopulationsContext)
    if (context === undefined) {
        throw new Error('Context must be used within a provider')
    }
    return context
}

const initialValues = [
    ["Paris", 2],
    ["Toronto", 2],
    ["Hamburg", 1],
    ["New York", 8]
];

export function ObservablePopulationsProvider({children}){

    const [populations, setPopulations] = useState(new Map(initialValues))
    const {notify, subscribe} = useObservable(notifyListener)

    /**
     * notify all subscribers once populations has been changed
     */
    useEffect(() => {
        notifyListener()
    }, [populations])

    /** notify all dependend components on relevant data changes
     *  @param index if null or undefined, all components get notified
     *  otherwise online the component with the given index will be notified
     **/
    function notifyListener(index){
        notify(populations, index)
    }

    /**
     * custom method to mutate data. 
     * This method is separately returned by usePopulationContext.
     * normal useContext(Population
     * @param id city name
     * @param population population number in million
     */
    const setPopulation = function(id, population){
        const lPopulations = new Map([...populations])

        lPopulations?.set(id, population)
        setPopulations(lPopulations)
    }

    return <ObservedContext.Provider value={subscribe}>
        <PopulationsContext.Provider
            value={{setPopulation}}>
            {children}
        </PopulationsContext.Provider>
    </ObservedContext.Provider>
}
```

## Usage / Example - Observable Context Consumer:
this example show the usage of using observable contexts.
Imagine we have multiple components that display the population number beneath the city name and
the number of rerenders that has been occured.
It also provides the ability to increase the population of
the respective city.

Technically the component takes the city name as argument to fetch the population number from the population context.
Without an observable context all components using the
population context would rerender even when their population number hasn't been changed.

```javascript
    export default function CityPopulation(props){

    const [rerenders, setRerenders] = useState(0)
    const [myPopulation, setMyPopulation] = useState()

    /**
     * if myPopulation has been changed, increase the number of rerenders
     */
    useEffect(() => {
        if (!myPopulation) return
        setRerenders(rerenders + 1)
    }, [myPopulation])

    /**
     * using an observable context for populations in order to update myPopulation only if it has been changed.
     * it will not rerender if the populations that are being provided by the observable context either has no entry for the city name
     * or the respective population number hasn't been changed.
     */
    useObservedContext((populations) => {
        console.log('received populations: ', populations)
        if (!populations?.has(props.name)) return
        if (populations.get(props.name) === myPopulation) return
        setMyPopulation(populations.get(props.name))
    }, ObservedPopulationsContext)

    /**
     * the population context also provides a function to increase the population for a city by
     * passing the city name and the population number
     */
    const {setPopulation} = usePopulationContext()

    /**
     * this increases the population of this components city
     */
    const increasePopulation = function(){
        setPopulation(props.name, myPopulation + 1)
    }

    return <Card key={props.name} style={{ width: '18rem', color: "#000" }}>
        <Card.Body>
            <Card.Title>{props.name}</Card.Title>
            <Card.Text>
                <div>Population: {myPopulation}</div>
                <div>Rerenders: {rerenders}</div>
            </Card.Text>
            <Button onClick={increasePopulation} variant="primary">Increase</Button>
        </Card.Body>
    </Card>
}
    
```