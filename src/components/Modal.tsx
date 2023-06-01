import React from "react";

interface ModalProps {
    title: string;
    message: string;
    confirmAction: () => void;
    cancelAction: () => void;
}

const Modal = ({ title, message, confirmAction, cancelAction }: ModalProps) => (
    <div className="modal" tabIndex={-1} style={{ display: "block"}}>
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={cancelAction}></button>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer justify-content-around">
                    <button type="button" className="btn btn-outline-dark" data-bs-dismiss="modal" onClick={cancelAction}>No</button>
                    <button type="button" className="btn btn-dark" onClick={confirmAction} >Yes</button>
                </div>
            </div>
        </div>
    </div>
)

export default Modal;