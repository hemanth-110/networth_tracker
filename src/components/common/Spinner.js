import React from 'react';
import { Spinner as BootstrapSpinner } from 'react-bootstrap';

const Spinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <BootstrapSpinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </BootstrapSpinner>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-5">
      <BootstrapSpinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </BootstrapSpinner>
    </div>
  );
};

export default Spinner;