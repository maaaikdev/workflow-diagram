import React, { Component } from 'react';
import './TaskComponent.css';
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs
import Collapsible from '../../modules/Collapsible';


class TaskComponent extends Component {

	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super(props);
        console.log("PROPS TASK COMPONET", this.props)
	};

    

    state = {
        name: '',
        type: 'TaskSystem',
        topic: '',
        index: 1,
        title: 'Task:'
    };    

    handleFormSubmit = (formData) => {
        this.props.onDataReceived(formData)
	};

    onSubmitDecisionParent = (decisionParent) => {
        console.log("decisionParent", decisionParent)
        this.props.onDataReceived(decisionParent)
    }

	render() {
        const id = "task-" + uuidv4();
		return (
            <div>
                <h3>Task Component</h3>
                <Collapsible 
                    id={id} 
                    children={this.state} 
                    onSubmit={this.handleFormSubmit}
                    onSubmitDecisionParent={this.onSubmitDecisionParent}
                />
            </div>
        );
	}
}

export default TaskComponent;