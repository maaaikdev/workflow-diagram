import { useEffect, useState, useRef } from 'react'
import './App.css';
import BarCollapsible from './components/BarCollapsible'
import BpmnViewerDiagram from './components/BpmnViewer';
import {useDiagramContext} from './store/store';

export default function App() {

	const { elementList, currentIdElement, existElement } = useDiagramContext();

	const [ cards, setCards ] = useState([]);

	const id = "B" + crypto.randomUUID();

	const childRef = useRef(null);

	useEffect(() => {
		if (childRef.current) {
		  	childRef.current.addSystemTask();
			childRef.current.addSystemTask();
			childRef.current.addSystemTask();
		}
	}, []);

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
                <bpmn:process id="${elementList[0].id}" name="${elementList[0].name}" isExecutable="false">
                    <bpmn:startEvent id="${elementList[1].id}"/>
                </bpmn:process>
                <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${elementList[0].id}">
                        <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="${elementList[1].id}">
                        <dc:Bounds x="173" y="102" width="36" height="36"/>
                        </bpmndi:BPMNShape>
                    </bpmndi:BPMNPlane>
                </bpmndi:BPMNDiagram>
            </bpmn:definitions>
        `;

	const [bpmnXml, setBpmnXml] = useState(bpmnXmlDiagram);
  	const handleXmlChange = (xml) => {
		setBpmnXml(xml);
	};

	const toggleComponent = (type, state) => {
		const id = crypto.randomUUID();
        const newSection = {
			id: 
				type === 'Decision' ? "decision-" + id :
				type === 'TaskSystem' ? "task-" + id :
				type === 'HumanTask' ? "humanTask-"+ id :
				type === 'EndEvent' ? "endEvent-" +id :
				"",
            name: '',
			type:
				type === 'Decision' ? "Decision" :
				type === 'TaskSystem' ? "TaskSystem" :
				type === 'HumanTask' ? "HumanTask" :
				type === 'EndEvent' ? "EndEvent" :
				"",
            topic: '',
            index: 1,
			title:
				type === 'Decision' ? "Decision" :
				type === 'TaskSystem' ? "Task" :
				type === 'HumanTask' ? "Human Task" :
				type === 'EndEvent' ? "End Event" :
				"",
        };
		addBarCollapsible(newSection);
	};

	const addComponentDecisionParent = (elementParent) => {
		addBarCollapsible({...elementParent, title: elementParent.type === 'Decision' ? 'Decision' : 'Task'})
    }

	const setConnectionToAddCondition = (elementParentLinkTo, linkTo, decisionElement) => {
		const linkToElement = elementList.find(x => x.name === linkTo);
		const conditionExpression = "${iD == 2}";
		childRef.current.addCondition(decisionElement.id, linkToElement.id, conditionExpression, decisionElement.name);
		
	}

	const addBarCollapsible = (element) => {
		const nuevaCard = 
			<BarCollapsible 
				key={cards.length} 
				content={element} 
				elementListSend={elementList} 
				addBarCollapsible={addComponentDecisionParent}
				setConnectionsToApp={setConnectionToAddCondition}
			/>;
		setCards(prevCards => [...prevCards, nuevaCard]);
	}

	const renderBpmnComponent = (elementList, exists) => {
		const elementCurrent = elementList.find(element => element.id === currentIdElement);
		const elementPrevious = elementList[elementList.length - 2].id;
		switch (elementCurrent?.type) {
			case 'TaskSystem':
				childRef.current.addSystemTask(elementCurrent, elementPrevious, exists);
				break;
			case 'Decision':
				childRef.current.addDecision(elementCurrent, elementPrevious, exists);
				break;
			case 'HumanTask':
				childRef.current.addHumanTask(elementCurrent, elementPrevious, exists);
				break;
			case 'EndEvent':
				childRef.current.endEventElement(elementCurrent, elementPrevious, exists);
				break;
			default:
				break;
		}
	}

	useEffect(() => {
		renderBpmnComponent(elementList, existElement);
	}, [elementList, existElement, currentIdElement]);


	return (
		<div className="App">
				<header className="App-header">
					<h1>BPMN Viewer</h1>
				</header>
				<main>
					<div className="Content-diagram" >
						<div>
							<BpmnViewerDiagram
								xml={bpmnXml}
								onXmlChange={handleXmlChange}
								ref={childRef}
							/>
						</div>
						<div>
							<div id="formsElements">

								<div id="elements-container" >
									<div id="action-buttons-container" className="actionButtonsContainer">
										<button id={'new-task-button-'+id} className="btnActions" onClick={() => toggleComponent('TaskSystem', true)}>Task +</button>
										<button id={'new-decision-button-'+id} className="btnActions" onClick={() => toggleComponent('Decision', true)}>Decision +</button>
										<button id={'new-status-button-'+id} className="btnActions" onClick={() => toggleComponent('HumanTask', true)}>Manual Task +</button>
										<button id={'new-link-button-'+id} className="btnActions" onClick={() => toggleComponent('EndEvent', true)}>Link to</button>
									</div>
									<div>
										{cards.map((card, index) => (
											<div key={index}>{card}</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
		</div>
	)

}