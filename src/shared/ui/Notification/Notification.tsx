'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/shared/styles/toast.css';

const Notification = () => {
  return (
    <ToastContainer
      position="top-right"
      hideProgressBar
      newestOnTop
      closeButton={false}
      toastClassName="custom-toast-wrapper"
    />
  );
};

export default Notification;
