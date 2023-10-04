import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDiagramContext } from '../store/store';

//BPMN
import BpmnViewer from 'bpmn-js/lib/Modeler'; // Use NavigatedViewer for zooming and panning
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import modelingModule from 'bpmn-js/lib/features/modeling';
import * as CamundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda.json';

const BpmnViewerDiagram = forwardRef(({ xml, onXmlChange }, ref) => {

    const store = useDiagramContext();
	const [ process, setProcess ] = useState(null)

    const containerRef = useRef(null);
    const modelerRef = useRef(null);
    const elementFactory = useRef(null);
    const elementRegistryRef = useRef(null);
    const modeling = useRef(null);
    const bpmnFactory = useRef(null);
    const moddle = useRef(null);

	useImperativeHandle(ref, () => ({
		addSystemTask,
		addHumanTask,
		addDecision,
		addCondition,
		addManualTask,
		endEventElement
	}));


    useEffect(() => {
        modelerRef.current = new BpmnViewer({
            container: containerRef.current,
            propertiesPanel: {
            parent: '#properties-panel'
            },
            additionalModules: [
                modelingModule
            ],
            moddleExtensions: {
                camunda: CamundaModdlePackage
            }
        });

        const modeler = modelerRef.current;
        
        modeler.importXML(xml,(err) => {
            if (!err) {
				elementFactory.current = modeler.get('elementFactory');
                elementRegistryRef.current = modeler.get('elementRegistry');
                modeling.current = modeler.get('modeling');
                bpmnFactory.current = modeler.get('bpmnFactory');
                moddle.current = modeler.get('moddle');

				setProcess(elementRegistryRef.current.get(store.elementList[0]?.id))
            } else {
                console.error(err);
            }
        });       

        modeler.on('element.changed', (event) => {
            const { element } = event;

            if (element.type === 'bpmn:StartEvent') {
            // Do something when a start event changes
            }

            // Handle other element types as needed

            //Get the updated BPMN XML
            modeler.saveXML({ format: true }, (err, updatedXml) => {
                if (!err) {
                onXmlChange(updatedXml);
                }
            });
        });

        return () => {
            modeler.destroy();
        };
    }, []);

    const addSystemTask = (configTask, previousElement, existsElement) => {
		if(!existsElement){

			if (bpmnFactory.current && elementFactory.current && modeling.current) {
				const servicesTaskBussinessObject = bpmnFactory.current.create('bpmn:ServiceTask', { id: configTask.id, name: configTask.name });
				const systemT = elementFactory.current.createShape({ type: 'bpmn:ServiceTask', businessObject: servicesTaskBussinessObject });

				modeling.current.setColor(systemT, {
					stroke: '#2E2E38'
				});

				systemT.businessObject['type'] = 'external';
				systemT.businessObject['topic'] = configTask.topic;

				const lastElement = elementRegistryRef.current.get(previousElement);

				const shapeCoords = getNewElementCoords(lastElement, 'SystemTask')

				modeling.current.createShape(systemT, {x: shapeCoords.x, y: shapeCoords.y}, process);

				modeling.current.createConnection(lastElement, systemT, { type: 'bpmn:SequenceFlow' }, process)
			}			
		} else {
			const systemTaskUpdate = elementRegistryRef.current.get(configTask.id);
			modeling.current.updateProperties(systemTaskUpdate, {
				name: configTask.name
			})
		}		
	}

    const addHumanTask = (configTask, previousElement, existsElement) => {
		if(!existsElement){
			if (bpmnFactory.current && elementFactory.current && modeling.current) {
				const humanTaskBussinessObject = bpmnFactory.current.create('bpmn:UserTask', { id: configTask.id, name: configTask.name });
			
				const userTask = elementFactory.current.createShape({ type: 'bpmn:UserTask', businessObject: humanTaskBussinessObject });
	
				modeling.current.setColor(userTask, {
					stroke: '#2E2E38'
				});
	
				userTask.businessObject['type'] = 'external';
				userTask.businessObject['topic'] = configTask.topic;
	
				const lastElement = elementRegistryRef.current.get(previousElement);
	
				const shapeCoords = getNewElementCoords(lastElement, 'HumanTask')
	
				modeling.current.createShape(userTask, {x: shapeCoords.x, y: shapeCoords.y}, process);
	
				modeling.current.createConnection(lastElement, userTask, { type: 'bpmn:SequenceFlow' }, process)
			}
		} else {
			const humanTaskUpdate = elementRegistryRef.current.get(configTask.id);
			modeling.current.updateProperties(humanTaskUpdate, {
				name: configTask.name
			})
		}
		
	}

	const addDecision = (configTask, previousElement, existsElement) => {
		if(!existsElement){
			if (bpmnFactory.current && elementFactory.current && modeling.current) {
				const gateWayBussinessObject = bpmnFactory.current.create('bpmn:ExclusiveGateway', { id: configTask.id, name: configTask.name });
		
				const gateWay = elementFactory.current.createShape({ type: 'bpmn:ExclusiveGateway', businessObject: gateWayBussinessObject });

				modeling.current.setColor(gateWay, {
					stroke: '#188CE5',
					fill: '#ccdaee'
				});

				const lastElement = elementRegistryRef.current.get(previousElement);

				const shapeCoords = getNewElementCoords(lastElement, 'Decision')

				modeling.current.createShape(gateWay, {x: shapeCoords.x, y: shapeCoords.y}, process);

				modeling.current.createConnection(lastElement, gateWay, { type: 'bpmn:SequenceFlow' }, process);

				const conditionExpression = '${iD == 2}'

				// addCondition(configTask.id, previousElement, conditionExpression, configTask.name)
			}
			
		} else {
			const gateWayUpdate = elementRegistryRef.current.get(configTask.id);
			modeling.current.updateProperties(gateWayUpdate, {
				name: configTask.name
			})
		}
		
	}

	const addCondition = (sourceElementId, targetElementId, condition, conditionName) => {

		console.log("addCondition", [sourceElementId, targetElementId, condition, conditionName])
		const sourceElement = elementRegistryRef.current.get(sourceElementId);
		const targetElement = elementRegistryRef.current.get(targetElementId);

		const sequenceFlow = elementRegistryRef.current.filter(element => {
			return (
				element.type === 'bpmn.SequenceFlow' &&
				element.source === sourceElement &&
				element.target === targetElement
			)
		})

			let targetHeight = 0;
			switch(targetElement.type) {
				case "bpmn:ServiceTask":
					targetHeight = sourceElement.y + (targetElement.height * 1.5);
					break;
				default:
					// targetElement.height;
					break;
			};
			const connection = modeling.current.createConnection(sourceElement, targetElement, {
				type: 'bpmn:SequenceFlow',
				waypoints: [
					{ x: sourceElement.x + (parseInt(sourceElement.width) / 2), y: sourceElement.y },
					{ x: sourceElement.x + (parseInt(sourceElement.width) / 2), y: targetHeight },
					{ x: targetElement.x + (parseInt(targetElement.width) / 2), y: targetHeight },
					{ x: targetElement.x + (parseInt(targetElement.width) / 2), y: sourceElement.y }
				]
			}, process)

		// if(sequenceFlow) {
		// 	this.connection = elementRegistryRef.current.get(sequenceFlow.id)
		// } else {
		// 	this.targetHeight = 0;
		// 	switch(targetElement.type) {
		// 		case "bpmn:ServiceTask":
		// 			this.targetHeight = this.sourceElement.y + (targetElement.height * 1.5);
		// 			break;
		// 		default:
		// 			// targetElement.height;
		// 			break;
		// 	};
		// 	this.connection = modeling.current.createConnection(this.sourceElement, targetElement, {
		// 		type: 'bpmn:SequenceFlow',
		// 		waypoints: [
		// 			{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.sourceElement.y },
		// 			{ x: this.sourceElement.x + (parseInt(this.sourceElement.width) / 2), y: this.targetHeight },
		// 			{ x: targetElement.x + (parseInt(targetElement.width) / 2), y: this.targetHeight },
		// 			{ x: targetElement.x + (parseInt(targetElement.width) / 2), y: this.sourceElement.y }
		// 		]
		// 	}, process)
		// };

		modeling.current.updateProperties(connection, {
			name: conditionName
		})

	}

	const addManualTask = (configTask, previousElement, existsElement) => {
		if(!existsElement){
			if (bpmnFactory.current && elementFactory.current && modeling.current) {
				const manualTaskBussinessObject = bpmnFactory.current.create('bpmn:ManualTask', { id: configTask.id, name: configTask.name });
		
				const manualTask = elementFactory.current.createShape({ type: 'bpmn:ManualTask', businessObject: manualTaskBussinessObject });

				modeling.current.setColor(this.userTask, {
					stroke: '#747480',
				});

				const lastElement = elementRegistryRef.current.get(previousElement);

				const shapeCoords = getNewElementCoords(lastElement, 'ManualTask')

				modeling.current.createShape(manualTask, {x: shapeCoords.x, y: shapeCoords.y}, process);

				modeling.current.createConnection(lastElement, manualTask, { type: 'bpmn:SequenceFlow' }, process)
			}
			
		} else {
			const manualTaskUpdate = elementRegistryRef.current.get(configTask.id);
			modeling.current.updateProperties(manualTaskUpdate, {
				name: configTask.name
			})
		}
		
	}

	const endEventElement = (configTask, previousElement, existsElement) => {
		console.log("END EVENT", [configTask, previousElement, existsElement])
		if(!existsElement){
			if (bpmnFactory.current && elementFactory.current && modeling.current) {
				const endElementkBussinessObject = bpmnFactory.current.create('bpmn:EndEvent', { id: configTask.id, name: configTask.name });
		
				const endEvent = elementFactory.current.createShape({ type: 'bpmn:EndEvent', businessObject: endElementkBussinessObject });

				modeling.current.setColor(endEvent, {
					stroke: '#FF4236',
					fill: '#FF9A91'
				});

				const lastElement = elementRegistryRef.current.get(previousElement);

				const shapeCoords = getNewElementCoords(lastElement, 'EndEvent')

				modeling.current.createShape(endEvent, {x: shapeCoords.x, y: shapeCoords.y}, process);

				modeling.current.createConnection(lastElement, endEvent, { type: 'bpmn:SequenceFlow' }, process)
			}
		} else {
			const endEventUpdate = elementRegistryRef.current.get(configTask.id);
			modeling.current.updateProperties(endEventUpdate, {
				name: configTask.name
			})
		}

		
	}

	const getNewElementCoords = (lastElement, elementType) => {
		const lastElementType = lastElement?.type;
		const gfx = elementRegistryRef.current.getGraphics(lastElement).getBoundingClientRect();

		// if (!gfx) {
		// 	// Handle the case where graphics are undefined
		// 	return { x: 0, y: 0 };
		// }
	
		// const gfxRect = gfx.getBoundingClientRect();

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

    return (
        <div ref={containerRef} className="bpmn-container" style={{ width: '100%', height: '500px', border: '1px solid #ccc', margin: '0 auto', backgroundColor: '#fff' }} />
    )
})

export default BpmnViewerDiagram;