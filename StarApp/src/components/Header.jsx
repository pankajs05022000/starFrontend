import React, { useState } from 'react';
import Modal from 'react-modal';
import TicketForm from './TicketForm';
import Toast from 'react-bootstrap/Toast';
import { MdInfoOutline } from "react-icons/md";

export default function Header({isManager}) {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    
    let [message, setMessage] = useState(""); // State variable for managing a message

    // This state variable manages the visibility of the toast. 
    const [showToast, setShowToast] = useState(false);

    // This function is responsible for toggling the state of the showToast variable.
    const toggleShowToast = () => setShowToast(!showToast);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <>
            <div className="header d-flex w-full justify-content-between">
                <h2 className="h2 m-2" style={{ fontWeight: "350", verticalAlign: 'middle' }}>{isManager ? "Tickets Received" : "Tickets"}</h2>
                <div>
                    <button onClick={openModal} className="btn btn-outline-dark m-2">Raise a ticket</button>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        style={{
                            overlay: {
                                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background overlay color
                            },
                            content: {
                                width: '50%', // Width of the modal
                                left: '25%', // Position from the left
                                top: '15%',
                                bottom: '5%'
                            },
                        }}
                    >
                        <div className='d-flex justify-content-between'>
                            <span className='h2 mb-2' style={{ fontWeight: "350", verticalAlign: 'middle' }}>Raise a ticket</span>
                            <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                        </div>
                        <TicketForm setMessage={setMessage} setShowToast={setShowToast} closeWin={closeModal} />
                    </Modal>
                </div>
                <Toast show={showToast} delay={5000} autohide onClose={toggleShowToast} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                    <Toast.Body className="bg-success text-white">
                        <strong><MdInfoOutline size={25} /> {message}</strong>
                        <button type="button" className="btn-close btn-close-white float-end" onClick={toggleShowToast}></button>
                    </Toast.Body>
                </Toast>
            </div>
        </>
    );
}