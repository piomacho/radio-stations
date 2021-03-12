import React, { useEffect } from "react";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

interface ConfirmationDialogType {
    title: string;
    message: string;
    onClickClose: () => void;
 }

export const MissingMapDialog = ({ title, message, onClickClose }: ConfirmationDialogType) => {
    useEffect(() => {
        confirmAlert({
        title:  title,
        message: message,
        buttons: [
            {
            label: 'Close',
            onClick: onClickClose
            },
        ]
        });
    });

    return (
      <div className='container'>
      </div>
    );

}