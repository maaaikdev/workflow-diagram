import React, { Component } from 'react';
import './ElementComponent.css';
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs
import Collapsible from '../../modules/Collapsible';


class ElementComponent extends Component {

	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super(props);
        this.state = {
            collapsibleSections: [],
        };
	};    

    isOpen = false;

    addCollapsible = (type) => {
        const id = uuidv4()
        const newSection = {
            id: type === 'Decision' ? "decision-" + id : "task-" + id,
            name: '',
            type: type === 'Decision' ? 'Decision' : 'TaskSystem',
            topic: '',
            index: 1,
            title: type === 'Decision' ? 'Decision' : 'Task'
        };
    
        this.setState((prevState) => ({            
            collapsibleSections: [...prevState.collapsibleSections, newSection],            
        }));
        this.isOpen = true;
        // console.log("ELEMENT COMPONENT 2", this.state, newSection, this.props)
    };

    state = {
        name: '',
        type: 'Decision',
        topic: '',
        index: 1,
        title: 'Decision:'
    };

    handleFormSubmit = (formData) => {
        // console.log("ELEMENT COMP", formData.content)
        this.props.onDataReceived(formData.content)
	};

    onSubmitDecisionParent = (decisionParent) => {
        console.log("decisionParent", decisionParent)
        this.props.getDecisionParent(decisionParent)
    }

	render() {
		return (
            <div>

                {this.isOpen ? (<div>
                    {this.state.collapsibleSections.map((section) => (
                        <Collapsible
                            key={section.id}
                            content={section}
                            elementList={this.props.listElement}
                            onSubmit={this.handleFormSubmit}
                            onSubmitDecisionParent={this.onSubmitDecisionParent}
                        />
                        ))}              
                </div>) : null}                
            </div>
        );
	}
}

export default ElementComponent;