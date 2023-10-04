import { createContext, useContext, useState } from "react"

const DiagramContext = createContext({
    elementList: [
        {
            id: 'Process_1',
            name: 'New_Process_Test'
        },
        {
			id: 'startEvent_2',
			name: 'Trigger',
			type: 'StartEvent',
            index: 1,
            topic: '',
            decisionParendId: ''
		}
    ],
    createElement:(element) => {},
    currentIdElement: '',
    updateElementName: (elementId, newName) => {},
    getExistELement:(boolean) => {}
});

export default function Store({children}){
    const [ elementList, setElementList ] = useState(DiagramContext._currentValue.elementList);
    const [ currentIdElement, setCurrentIdElement ] = useState('');
    const [ existElement, setExistElement ] = useState(false);

    function createElement(element){
        const list = [...elementList];
        list.push(element)
        setElementList(list)
    }

    function updateCurrentId(id) {
        setCurrentIdElement(id)
    }

    function updateElementName(elementId, newName) {       
       
        const updatedList = elementList.map((element) => {
            if (element.id === elementId) {
                return { ...element, name: newName };
            }
            return element;
        });
        setElementList(updatedList);
    }

    function getExistELement(boolean) {
        setExistElement(boolean)
    }


    return (
        <DiagramContext.Provider
            value={{
                elementList,
                createElement,
                currentIdElement,
                updateCurrentId,
                updateElementName,
                existElement,
                setExistElement,
                getExistELement
            }}
        >
            {children}
        </DiagramContext.Provider>
    )
}

export function useDiagramContext() {
    return useContext(DiagramContext)
}