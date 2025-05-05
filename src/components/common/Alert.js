import React, { useState, useEffect } from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

const Alert = ({ variant = 'info', message, dismissible = true, timeout = 0 }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setShow(false);
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [timeout]);

  if (!show || !message) {
    return null;
  }

  return (
    <BootstrapAlert 
      variant={variant} 
      onClose={() => setShow(false)} 
      dismissible={dismissible}
    >
      {message}
    </BootstrapAlert>
  );
};

export default Alert;