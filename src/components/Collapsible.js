import React, { useState } from 'react';
import './Collapsible.css';
import { useDiagramContext } from './../store/store';

const Collapsible = (props) => {

    const { content, componentDecision, addConnectDecision, localStorageKey } = props;
    const { elementList, createElement, updateCurrentId, updateElementName, getExistELement } = useDiagramContext();
    const [ elementContent, setElementContent ] = useState({});
    const [ disabled, setDisabled ] = useState(false)
    //  
 
    const [ formData, setFormData ] = useState(() => {
        // name: '',
        const storedData = localStorage.getItem(localStorageKey);
        console.log("storedData", storedData)
        return storedData ? JSON.parse(storedData) : { name: '' };
        // other form fields
    });


    const [selectedNotMet, setSelectedNotMet] = useState('');
    const [selectedMet, setSelectedMet] = useState('');

    const handleSelectChangeNotMet = (e, elementDecisdion) => {
        setSelectedNotMet(e.target.value)
        const decision = {...content}
        const linkTo = e.target.value
        const id = crypto.randomUUID();
        const newElementToLink = {...content, decisionParendId: elementDecisdion, type: 'LinkTo', id: 'not-met-link-'+id}
        addConnectDecision(newElementToLink, linkTo, decision);
        setDisabled(true)
    }

    const handleSelectChangeMet = (e, elementDecisdion) => {
        setSelectedMet(e.target.value)
        const decision = {...content}
        const linkTo = e.target.value
        const id = crypto.randomUUID();
        const newElementToLink = {...content, decisionParendId: elementDecisdion, type: 'LinkTo', id: 'met-link-'+id}
        addConnectDecision(newElementToLink, linkTo, decision);
        setDisabled(false)
    }
    
    const handleChange = event => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    const handleSubmit = event => {
        event.preventDefault();
        const { content, handleSetName } = props;
        const newElement = {...content, name: formData.name };
        setElementContent(newElement);
        handleSetName(formData.name)
        
        noDuplicates(newElement);
        localStorage.setItem(localStorageKey, JSON.stringify(formData));
    };

    const noDuplicates = (element) => {
        let obj = {};
		let noDuplicate = elementList.filter(o => obj[o.id] ? false : obj[o.id] = true);

        const exist = noDuplicate.some(x => x.id === element.id);
		if(!exist) {
            getExistELement(false)
			createElement(element);
            updateCurrentId(element.id);
		} else {
            getExistELement(true)
            const updatedElementList = [...elementList];
            const elementToUpdate = updatedElementList.find(x => x.id === element.id);    

            if (elementToUpdate) {
                elementToUpdate.name = formData.name;
                updateElementName(elementToUpdate.id, elementToUpdate.name);
            }
        }
        
    }

    const createNewElementDecision = (typeParent, idParent) => {
        const { content } = props;        
        const id = crypto.randomUUID();
        const newSectionDesicion = {...content, decisionParendId: 'NewTask', type: typeParent, id: idParent+id}
        componentDecision(newSectionDesicion);
        updateCurrentId(newSectionDesicion.id);
        noDuplicates(newSectionDesicion);
    }

    

    const buttonsMet = (elementContent) => {
        const id = "B" + crypto.randomUUID();
        const deleteIds = ['Process_1'];
        const listElementsToLink = elementList.filter((elemento) => !deleteIds.includes(elemento.id));
        listElementsToLink.pop();

        return (
            <div className='buttonsMets'>
                <p>X - If the condition is not met</p>
                <div className='left'>                     
                    <select disabled={disabled} name="not-met" id="not-met" className='select-element' value={selectedNotMet} onChange={(e) => handleSelectChangeNotMet(e, elementContent)}>
                        <option >Link To</option>
                        {listElementsToLink.map(({ name }, index) => <option key={index} value={name} >{name}</option>)}
                    </select>
                    <button 
                        id={'new-task-not-met-'+id} 
                        className={`btnActions ${disabled ? 'disabled' : ''}`}
                        disabled={disabled}
                        onClick={() => createNewElementDecision('TaskSystem', 'not-met-task-', elementContent)}
                    >Task</button>
                    <button 
                        id={'new-decision-not-met-'+id}
                        className={`btnActions ${disabled ? 'disabled' : ''}`}
                        disabled={disabled}
                        onClick={() => createNewElementDecision('Decision', 'not-met-decision-', elementContent)}
                    >Decision</button>
                </div>
                <p>✓ If the condition is met</p>
                <div className='right'>                    
                    <select disabled={!disabled} name="met" id="met" className='select-element' value={selectedMet} onChange={(e) => handleSelectChangeMet(e, elementContent)}>
                        <option>Link To </option>
                        {listElementsToLink.map(({ name }, index) => <option key={index} value={name} >{name}</option>)}
                    </select>
                    <button 
                        id={'new-task-met-'+id} 
                        className={`btnActions ${!disabled ? 'disabled' : ''}`}
                        disabled={!disabled}
                        onClick={() => createNewElementDecision('TaskSystem', 'met-task-')}
                    >Task</button>
                    <button 
                        id={'new-decision-met-'+id} 
                        className={`btnActions ${!disabled ? 'disabled' : ''}`}
                        disabled={!disabled}
                        onClick={() => createNewElementDecision('Decision', 'met-decision-')}
                    >Decision</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="collapsible-content">
                <form onSubmit={handleSubmit} className='form-elements'>
                    <div className='field-form'>
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />                    
                    </div>
                    <button type="submit">Create {elementContent.title}</button>           
                </form>
                {content.type === 'Decision' ? buttonsMet(elementContent) : ''}
            </div>
        </>
    )
};

export default Collapsible;