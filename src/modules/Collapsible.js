import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs
import './Collapsible.css';

const Collapsible = (props) => {
    // console.log("PROPS COLLASIBLE", props.elementList)
    const { content } = props;
    const [isCollapsed, setIsCollapsed] = useState(true);
 
    const [formData, setFormData] = useState({
        name: '',
        // other form fields
    });

    

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    
    const handleChange = event => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    const handleSubmit = event => {
        event.preventDefault();
        props.content.name = formData.name;
        props.onSubmit({...props, name: formData.name})
        setIsCollapsed(!isCollapsed);
    };

    const createNewElementDecision = (typeParent, idParent) => {
        const id = uuidv4();
        props.onSubmitDecisionParent({...content, decisionParendId: 'NewTask', type: typeParent, id: idParent+id});
        console.log("DECISION PARENT", {...content, decisionParendId: 'NewTask', type: typeParent, id: idParent+id})
        // setIsCollapsed(!isCollapsed+1)
    }

    const buttonsMet = () => {
        const id = "B" + uuidv4();        	

        return (
            <div className='buttonsMets'>
                X - If the condition is not met
                <div className='left'>                     
                    <select name="not-met" id="not-met" className='select-element'>
                        <option>-- Link To --</option>
                        {props.elementList.map(({ name }, index) => <option value={name} >{name}</option>)}
                    </select>
                    <button 
                        id={'new-task-not-met-'+id} 
                        className="btnActions" 
                        onClick={() => createNewElementDecision('TaskSystem', 'not-met-task-')}
                    >Task</button>
                    <button 
                        id={'new-decision-not-met-'+id} 
                        className="btnActions"
                        onClick={() => createNewElementDecision('Decision', 'not-met-decision-')}
                    >Decision</button>
                </div>
                ✓ If the condition is met
                <div className='right'>
                    
                    <select name="met" id="met">
                        <option>-- Link To --</option>
                        {props.elementList.map(({ name }, index) => <option value={name} >{name}</option>)}
                    </select>
                    <button 
                        id={'new-task-met-'+id} 
                        className="btnActions"
                        onClick={() => createNewElementDecision('TaskSystem', 'met-task-')}
                    >Task</button>
                    <button 
                        id={'new-decision-met-'+id} 
                        className="btnActions"
                        onClick={() => createNewElementDecision('Decision', 'met-decision-')}
                    >Decision</button>
                </div>
            </div>
        );
    }

  return (
    <div className="collapsible">
      <div className="collapsible-header" onClick={toggleCollapse}>
        <h3>{content.title}: <span>{formData.name}</span></h3>
        <i className={!isCollapsed ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"></i>
      </div>
      {!isCollapsed && 
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
                <button type="submit">Create {content.title}</button>                
            </form>
            {content.type === 'Decision' ? buttonsMet() : ''}
        </div>
      }
    </div>
  );
};

export default Collapsible;