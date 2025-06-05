
import React from "react";
import '../../styles/_toasterStyle.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

// success toast
export const toastSuccess = (toastHeader, toastContent, autoClose) => {
  toast(
    <p>{toastHeader}<br /><span>{toastContent}</span></p>,
    {
      className: 'success-background',
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    }
  )
}

// error toast
export const toastError = (toastHeader, toastContent, autoClose) => {
  toast(
    <p>{toastHeader}<br /><span>{toastContent}</span></p>,
    {
      className: 'error-background',
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    }
  )
}
// warning toast
export const toastWarning = (toastHeader, toastContent, autoClose) => {
  toast(
    <p>{toastHeader}<br /><span>{toastContent}</span></p>,
    {
      className: 'warning-background',
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    }
  )
}
// information toast
export const toastInformation = (toastHeader, toastContent, autoClose) => {
  toast(
    <p>{toastHeader}<br /><span>{toastContent}</span></p>,
    {
      className: 'information-background',
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
    }
  )
}