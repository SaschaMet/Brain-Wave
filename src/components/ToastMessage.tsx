import React from "react";

type ToastMessageProps = {
    message: string;
    type: 'success' | 'error';
};

export const ToastMessage = ({ message, type }: ToastMessageProps) => {
    const [show, setShow] = React.useState(true);

    return (
        <div className="toast border" style={{ display: show ? "block" : "none"}} >
            <div className="toast-header">            
                    <strong className="me-auto">{type === "success" ? "✅ Success" : "❌ Error"}</strong>
                    <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={() => setShow(false)} ></button>
                </div>
                <div className="toast-body">
                    {message}
                </div>
        </div>
    );
};
