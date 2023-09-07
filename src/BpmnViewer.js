import React, { Component } from 'react';
import BpmnViewer from 'bpmn-js/lib/Modeler'; // Use NavigatedViewer for zooming and panning
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import modelingModule from 'bpmn-js/lib/features/modeling';
import { v4 as uuidv4 } from 'uuid'; // Import a library for generating unique IDs

import * as CamundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda.json';

// import diagramNew from './resources/new-bpmn-diagram.bpmn';


class BpmnViewerComponent extends Component {

	constructor(props) {
		super(props);
		this.containerRef = React.createRef();
		this.bpmnViewer = null; // Store a reference to the BPMN viewer instance;
		this.addSystemTask = this.addSystemTask.bind(this);
		this.addDecision = this.addDecision.bind(this);
	};

	componentDidMount() {
		this.bpmnViewer = new BpmnViewer({
			container: this.containerRef.current,
			additionalModules: [
				modelingModule
				// ... other modules you might need
			  ],
			  moddleExtensions: {
				camunda: CamundaModdlePackage
			  },
			keyboard: {
				bindTo: document
			}
		});
		this.importBpmnDiagram();
	}

	componentWillUnmount() {
		this.destroyBpmnDiagram();
	}

	destroyBpmnDiagram() {
		if (this.bpmnViewer) {
		  	this.bpmnViewer.destroy();
		  	this.bpmnViewer = null;
		}
	}



	importBpmnDiagram = async () => {

		const { process } = this.props; 
		const { startEVent } = this.props;
		const { systemTask } = this.props;
		const { humanTask } = this.props
		const { decisionElement } = this.props


	const bpmnXmlDiagram = `
		<bpmn:definitions 
			xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
			xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
			xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
			xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
			xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xmlns:modeler="http://camunda.org/schema/modeler/1.0"
			id="Definitions_1"
			targetNamespace="http://bpmn.io/schema/bpmn"
			exporter="Camunda Modeler"
			exporterVersion="5.2.0"
			modeler:executionPlatform="Camunda Platform"
			modeler:executionPlatformVersion="7.17.0"
			>
			<bpmn:process id="${process.id}" name="${process.name}  " isExecutable="false">
				<bpmn:startEvent id="${startEVent.id}"/>
			</bpmn:process>
			<bpmndi:BPMNDiagram id="BPMNDiagram_1">
				<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${process.id}">
					<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="${startEVent.id}">
					<dc:Bounds x="173" y="102" width="36" height="36"/>
					</bpmndi:BPMNShape>
				</bpmndi:BPMNPlane>
			</bpmndi:BPMNDiagram>
		</bpmn:definitions>
	`;

		try {
			// const bpmnXml = await bpmnXmlDiagram.text();
			await this.bpmnViewer.importXML(bpmnXmlDiagram);
		} catch (error) {
			console.error('Error importing BPMN diagram:', error);
		}

		this.elementFactory = this.bpmnViewer.get('elementFactory');
		this.elementRegistry = this.bpmnViewer.get('elementRegistry');
		this.modeling = this.bpmnViewer.get('modeling');
		this.bpmnFactory = this.bpmnViewer.get('bpmnFactory');
		this.moddle = this.bpmnViewer.get('moddle');
		this.eventBus = this.bpmnViewer.get('eventBus');

		this.process = this.elementRegistry.get(process.id);

		// this.addSystemTask(systemTask, startEVent);
	};
  	
	addSystemTask(configTask, previousElement, existsElement) {
		if(!existsElement){
			const servicesTaskBussinessObject = this.bpmnFactory.create('bpmn:ServiceTask', { id: configTask.id, name: configTask.name });
		
			this.systemTask = this.elementFactory.createShape({ type: 'bpmn:ServiceTask', businessObject: servicesTaskBussinessObject });

			this.modeling.setColor(this.systemTask, {
				stroke: '#2E2E38'
			});

			this.systemTask.businessObject['type'] = 'external';
			this.systemTask.businessObject['topic'] = configTask.topic;

			const lastElement = this.elementRegistry.get(previousElement);

			const shapeCoords = this.getNewElementCoords(lastElement, 'SystemTask')

			this.modeling.createShape(this.systemTask, {x: shapeCoords.x, y: shapeCoords.y}, this.process);

			this.modeling.createConnection(lastElement, this.systemTask, { type: 'bpmn:SequenceFlow' }, this.process)
		} else {
			const systemTaskUpdate = this.elementRegistry.get(configTask.id);
			this.modeling.updateProperties(systemTaskUpdate, {
				name: configTask.name
			})
		}		
	}

	addHumanTask(configTask, previousElement, existsElement){
		const humanTaskBussinessObject = this.bpmnFactory.create('bpmn:UserTask', { id: configTask.id, name: configTask.name });
		
		this.userTask = this.elementFactory.createShape({ type: 'bpmn:UserTask', businessObject: humanTaskBussinessObject });

		this.modeling.setColor(this.userTask, {
			stroke: '#2E2E38'
		});

		this.userTask.businessObject['type'] = 'external';
		this.userTask.businessObject['topic'] = configTask.topic;

		const lastElement = this.elementRegistry.get(previousElement.id);

		const shapeCoords = this.getNewElementCoords(lastElement, 'HumanTask')

		this.modeling.createShape(this.userTask, {x: shapeCoords.x, y: shapeCoords.y}, this.process);

		this.modeling.createConnection(lastElement, this.userTask, { type: 'bpmn:SequenceFlow' }, this.process)
	}

	addDecision(configTask, previousElement, existsElement){
		if(!existsElement){
			const gateWayBussinessObject = this.bpmnFactory.create('bpmn:ExclusiveGateway', { id: configTask.id, name: configTask.name });
		
			this.gateWay = this.elementFactory.createShape({ type: 'bpmn:ExclusiveGateway', businessObject: gateWayBussinessObject });

			this.modeling.setColor(this.gateWay, {
				stroke: '#188CE5',
				fill: '#ccdaee'
			});

			const lastElement = this.elementRegistry.get(previousElement);

			const shapeCoords = this.getNewElementCoords(lastElement, 'Decision')

			this.modeling.createShape(this.gateWay, {x: shapeCoords.x, y: shapeCoords.y}, this.process);

			this.modeling.createConnection(lastElement, this.gateWay, { type: 'bpmn:SequenceFlow' }, this.process);

			const conditionExpression = '${iD == 2}'

			this.addCondition(configTask.id, previousElement, conditionExpression, configTask.name)
		} else {
			const gateWayUpdate = this.elementRegistry.get(configTask.id);
			this.modeling.updateProperties(gateWayUpdate, {
				name: configTask.name
			})
		}
		
	}

	addCondition(sourceElementId, targetElementId, condition, conditionName) {
		this.sourceElement = this.elementRegistry.get(sourceElementId);
		this.targetElement = this.elementRegistry.get(targetElementId);

		const sequenceFlow = this.elementRegistry.filter(element => {
			return (
				element.type === 'bpmn.SequenceFlow' &&
				element.source === this.sourceElement &&
				element.target === this.targetElement
			)
		})

		this.targetHeight = 0;
			switch(this.targetElement.type) {
				case "bpmn:ServiceTask":
					this.targetHeight = this.sourceElement.y + (this.targetElement.height * 1.5);
					break;
				default:
					// this.targetElement.height;
					break;
			};
			this.connection = this.modeling.createConnection(this.sourceElement, this.targetElement, {
				type: 'bpmn:SequenceFlow',
				waypoints: [
					{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.sourceElement.y },
					{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.targetHeight },
					{ x: this.targetElement.x + (parseInt(this.targetElement.width) / 2), y: this.targetHeight },
					{ x: this.targetElement.x + (parseInt(this.targetElement.width) / 2), y: this.sourceElement.y }
				]
			}, this.process)

		// if(sequenceFlow) {
		// 	this.connection = this.elementRegistry.get(sequenceFlow.id)
		// } else {
		// 	this.targetHeight = 0;
		// 	switch(this.targetElement.type) {
		// 		case "bpmn:ServiceTask":
		// 			this.targetHeight = this.sourceElement.y + (this.targetElement.height * 1.5);
		// 			break;
		// 		default:
		// 			// this.targetElement.height;
		// 			break;
		// 	};
		// 	this.connection = this.modeling.createConnection(this.sourceElement, this.targetElement, {
		// 		type: 'bpmn:SequenceFlow',
		// 		waypoints: [
		// 			{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.sourceElement.y },
		// 			{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.targetHeight },
		// 			{ x: this.targetElement.x + (parseInt(this.targetElement.width) / 2), y: this.targetHeight },
		// 			{ x: this.targetElement.x + (parseInt(this.targetElement.width) / 2), y: this.sourceElement.y }
		// 		]
		// 	}, this.process)
		// };

		this.modeling.updateProperties(this.connection, {
			name: conditionName
		})

	}

	addManualTask(configTask, previousElement){

		const manualTaskBussinessObject = this.bpmnFactory.create('bpmn:ManualTask', { id: configTask.id, name: configTask.name });
		
		this.gateWay = this.elementFactory.createShape({ type: 'bpmn:ManualTask', businessObject: manualTaskBussinessObject });

		this.modeling.setColor(this.userTask, {
			stroke: '#747480',
		});

		const lastElement = this.elementRegistry.get(previousElement.id);

		const shapeCoords = this.getNewElementCoords(lastElement, 'ManualTask')

		this.modeling.createShape(this.gateWay, {x: shapeCoords.x, y: shapeCoords.y}, this.process);

		this.modeling.createConnection(lastElement, this.gateWay, { type: 'bpmn:SequenceFlow' }, this.process)
	}

	endEventElement(configTask, previousElement){

		const endElementkBussinessObject = this.bpmnFactory.create('bpmn:EndEvent', { id: configTask.id, name: configTask.name });
		
		this.endEvent = this.elementFactory.createShape({ type: 'bpmn:EndEvent', businessObject: endElementkBussinessObject });

		this.modeling.setColor(this.userTask, {
			stroke: '#FF4236',
			fill: '#FF9A91'
		});

		const lastElement = this.elementRegistry.get(previousElement.id);

		const shapeCoords = this.getNewElementCoords(lastElement, 'ManualTask')

		this.modeling.createShape(this.endEvent, {x: shapeCoords.x, y: shapeCoords.y}, this.process);

		this.modeling.createConnection(lastElement, this.endEvent, { type: 'bpmn:SequenceFlow' }, this.process)
	}

	getNewElementCoords(lastElement, elementType) {
		const lastElementType = lastElement?.type;
		const gfx = this.elementRegistry.getGraphics(lastElement).getBoundingClientRect();

		var newCoords = {
			x: 0,
			y: 0
		}

		switch (elementType) {
			case 'SystemTask':
				newCoords.x = lastElement.x + 200;
				newCoords.y = 120;
				// this.shapes.push(lastElement);
				break;
			default:
				newCoords.x = lastElement.x + 200;
				newCoords.y = 120;
				break;
		}

		return newCoords
	}

	render() {
		return (
		<div>
			<div ref={this.containerRef} style={{ width: '100%', height: '400px', border: '1px solid #ccc', margin: '32px auto' }} />
		</div>
		)
	}
}

export default BpmnViewerComponent;