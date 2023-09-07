import React, { Component } from 'react';
import './App.css';
import BpmnViewerComponent from './BpmnViewer';
import ElementComponent from './components/ElementComponent/ElementComponent';
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs



class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			elementList: []
		}
		this.addsystemTaskMethod = React.createRef();
		this.createFormElement = React.createRef();

		const getStartEvent = {
			id: 'startEvent_2',
			name: 'Trigger',
			type: 'StartEvent'
		};
		
		this.state.elementList.push(getStartEvent)
	};

	state = {
		showDecisionComponent: false,
	};

	toggleComponent = (type, state) => {
		this.setState(prevState => ({
			showDecisionComponent: true,
			type: type
		}));
		this.typeElement = type;
		this.createFormElement.current.addCollapsible(type);
	};


	AddElementsButtons() {
		const id = "B" + uuidv4();        	

		return (
			<div id="action-buttons-container" className="actionButtonsContainer">
				<button id={'new-task-button-'+id} className="btnActions" onClick={() => this.toggleComponent('TaskSystem', true)}>New Task +</button>
				<button id={'new-decision-button-'+id} className="btnActions" onClick={() => this.toggleComponent('Decision', true)}>New Decision +</button>
				{/* <button id={'new-status-button-'+id} className="btnActions" onClick={this.toggleComponent}>New Manual Task</button>
				<button id={'new-link-button-'+id} className="btnActions" onClick={this.toggleComponent}>New Link to</button> */}
			</div>
		);
	}

	handleDataReceived = (data) => {
		console.log('Data received ====== >:', data);

		let obj = {};
		let noDuplicate = this.state.elementList.filter(o => obj[o.id] ? false : obj[o.id] = true);
		this.elementList = noDuplicate;

		console.log("ARRAY NO DUPLICATE", this.elementList)

		this.elementExists = false;
		if(this.state.elementList.filter(x => x.id === data.id).length === 0) {
			this.state.elementList.push(data);
		} else {
			this.elementExists = true;
		}

		this.previousElement = this.state.elementList[this.state.elementList.length - 2].id;

		this.renderBpmnComponent(this.previousElement, data);
	}

	renderBpmnComponent = (previousElement, currentlyElement) => {
		switch (currentlyElement.type) {
			case 'TaskSystem':
				this.addsystemTaskMethod.current.addSystemTask(currentlyElement, previousElement, this.elementExists);
				break;
			case 'Decision':
				this.addsystemTaskMethod.current.addDecision(currentlyElement, previousElement, this.elementExists);
				break;
			default:
				break;
		}
	}

	handleDataReceivedDecisionParent = (data) => {
		console.log('Data received in Decision parent ====== >:', data);
		this.createFormElement.current.addCollapsible(data.type);
	}

	render() {

		const processDefinition = {
			id: 'Process_1',
			name: 'New_Process_Test'
		}
	
		const getStartEvent = {
			id: 'startEvent_2',
			name: 'Trigger',
			type: 'StartEvent'
		}
	
		// const addhumanTask = {
		// 	id: 'humanTask_1',
		// 	name: 'Human Task 1',
		// 	type: 'TaskHuman',
		// 	topic: '',
		// 	index: 1
		// }
	
		// const addManualTask = {
		// 	id: 'manualtask_1',
		// 	name: 'Manual Task 1',
		// 	type: 'ManualTask',
		// 	topic: '',
		// 	index: 1
		// }
	
		// const addEndEventElement = {
		// 	id: 'endEvent_1',
		// 	name: 'End Event 1',
		// 	type: 'End Event',
		// 	topic: '',
		// 	index: 1
		// }
		
		return (
			<div className="App">
				<header className="App-header">
					<h1>BPMN Viewer</h1>
				</header>
				<main>
					<div className="Content-diagram" >
						<div>
							<BpmnViewerComponent 
								process={processDefinition} 
								startEVent={getStartEvent} 
								ref={this.addsystemTaskMethod}
							/>
						</div>
						<div>
							<div id="formsElements">
							
								<div id="elements-container" >
									{this.AddElementsButtons()}
									{<ElementComponent 
										type={this.typeElement}
										listElement={this.state.elementList}
										ref={this.createFormElement} 
										onDataReceived={this.handleDataReceived}
										getDecisionParent={this.handleDataReceivedDecisionParent}
									/>}
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		)
	}
}

export default App;