import React, { useEffect } from "react";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

interface ConfirmationDialogType {
    title: string;
    message: string;
    onClickYes: () => void;
    onClickNo: () => void;
 }

export const ConfirmationDialog = ({ title, message, onClickYes, onClickNo }: ConfirmationDialogType) => {
    useEffect(() => {
        confirmAlert({
        title:  title,
        message: message,
        buttons: [
            {
            label: 'Tak',
            onClick: onClickYes
            },
            {
            label: 'Nie',
            onClick: onClickNo
            }
        ]
        });
    });

    return (
      <div className='container'>
      </div>
    );

}