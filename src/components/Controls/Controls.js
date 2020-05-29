import React, { useState } from 'react';
import { Navbar, Nav, Button, ButtonGroup } from 'reactstrap';

import './Controls.css';

const Controls = ({ setAnnotate, setToggledLayer, map, setMap }) => {
    const [activeLayers, setActiveLayers] = useState({});

    /**
     * Toggles the enabled state of layer.
     * @param selected The user-selected layer
     */
    const onToggle = (selected) => {
        activeLayers[selected] = !activeLayers[selected];
        setActiveLayers({ ...activeLayers });
        setToggledLayer({ name: selected, enabled: activeLayers[selected] });
    }

    return (
        <Navbar color="transparent" expand="md">
            <Nav className="mr-auto" navbar>
                <Button
                    color="secondary"
                    onClick={() => { setMap(!map) }}>
                    Toggle 3D
                </Button>
                <ButtonGroup>
                    <Button
                        className="toggle"
                        color="primary"
                        onClick={() => onToggle('Walmart')}
                        active={activeLayers['Walmart']}>
                        Walmart
                    </Button>
                    <Button
                        className="toggle"
                        color="danger"
                        onClick={() => onToggle('Target')}
                        active={activeLayers['Target']}>
                        Target
                    </Button>
                </ButtonGroup>
                <Button
                    color="secondary"
                    onClick={() => { setAnnotate(true) }}>
                    + Annotate
                </Button>
            </Nav>
        </Navbar>
    )
}

export default Controls;