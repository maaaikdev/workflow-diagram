import { useState, useEffect } from 'react'
import Collapsible from "./Collapsible";


const BarCollapsible = (props) => {

    const { content, addBarCollapsible, setConnectionsToApp } = props;
    const [ isCollapsed, setIsCollapsed ] = useState(true);
    const [ nameELement, setNameELement ] = useState('');

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSetName = (name) => {
        setNameELement(name);
    }

    const addComponentDecisionParent = (elementParent) => {
        addBarCollapsible(elementParent);
    }

    const getLinkToDecision = (connecton, linkTo, decision) => {
        setConnectionsToApp(connecton, linkTo, decision);
    }

    return (
        <div className="collapsible">
            <div className="collapsible-header" onClick={toggleCollapse}>
            <h3>{content.title}: <span>{nameELement}</span></h3>
            <i className={!isCollapsed ? "fa fa-chevron-up" : "fa fa-chevron-down"} aria-hidden="true"></i>
            </div>
            {!isCollapsed && 
                <Collapsible 
                    content={content} 
                    handleSetName={handleSetName} 
                    componentDecision={addComponentDecisionParent}
                    addConnectDecision={getLinkToDecision}
                />}
        </div>
    )
}

export default BarCollapsible;