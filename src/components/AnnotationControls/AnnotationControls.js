import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Form } from 'reactstrap';

import './AnnotationControls.css';

const AnnotationControls = ({
    modal,
    currModal,
    annotateObj,
    toggleModal,
    setCurrModal,
    addAnnotation,
    getAnnotationPos,
    updateAnnotationText }) => {

    const [input, setInput] = useState('');

    // Get edited annotation text
    const startEditText = () => setCurrModal(2);
    // Get new annotation position
    const startMove = () => {
        getAnnotationPos(false);
        toggleModal();
    }
    // Set annotation text
    const submitNewText = () => {
        addAnnotation(input);
        setInput('');
        toggleModal();
    }
    // Update annotation text
    const submitEditText = () => {
        updateAnnotationText(input);
        setCurrModal(2);
        toggleModal();
    }

    // Populate edit annotation input with original text
    useEffect(() => {
        if (annotateObj)
            setInput(annotateObj.text);
    }, [annotateObj]);

    return (
        <div>
            <Modal isOpen={modal} toggle={toggleModal} autoFocus={false}>
                {currModal === 0 &&
                    <Form onSubmit={e => e.preventDefault()}>
                        <ModalHeader>Edit Annotation</ModalHeader>
                        <ModalBody>
                            <Button color="light" onClick={startEditText}>Edit Text</Button>{' '}
                            <Button color="light" onClick={startMove}>Move</Button>{' '}
                        </ModalBody>
                    </Form>
                }{currModal === 1 &&
                    <Form onSubmit={e => e.preventDefault()}>
                        <ModalHeader>Add Annotation Text</ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus={true}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' ? submitNewText() : null}
                                placeholder="Write some text..." />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="light" onClick={submitNewText}>Submit</Button>
                        </ModalFooter>
                    </Form>
                }{currModal === 2 &&
                    <Form onSubmit={e => e.preventDefault()}>
                        <ModalHeader>Edit Annotation Text</ModalHeader>
                        <ModalBody>
                            <Input
                                autoFocus={true}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' ? submitEditText() : null}
                                value={input} />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="light" onClick={submitEditText}>Submit</Button>
                        </ModalFooter>
                    </Form>
                }
            </Modal>
        </div>
    )
}

export default AnnotationControls;