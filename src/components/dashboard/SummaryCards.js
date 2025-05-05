import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRupeeSign, 
  faHandHoldingUsd, 
  faExclamationTriangle, 
  faUsers 
} from '@fortawesome/free-solid-svg-icons';

const SummaryCards = ({ summary }) => {
  return (
    <Row>
      <Col md={3} sm={6} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="bg-primary text-white rounded">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="text-white-50">Total Loaned</h6>
                <h3 className="mb-0">₹{summary.totalLoaned.toFixed(2)}</h3>
              </div>
              <FontAwesomeIcon icon={faRupeeSign} size="2x" className="text-white-50" />
            </div>
            <div className="mt-3 small">
              {summary.loanCount} total loans
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} sm={6} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="bg-success text-white rounded">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="text-white-50">Total Collected</h6>
                <h3 className="mb-0">₹{summary.totalCollected.toFixed(2)}</h3>
              </div>
              <FontAwesomeIcon icon={faHandHoldingUsd} size="2x" className="text-white-50" />
            </div>
            <div className="mt-3 small">
              {summary.paidLoanCount} loans fully paid
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} sm={6} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="bg-warning text-dark rounded">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="text-dark-50">Outstanding</h6>
                <h3 className="mb-0">₹{summary.totalOutstanding.toFixed(2)}</h3>
              </div>
              <FontAwesomeIcon icon={faUsers} size="2x" className="text-dark-50" />
            </div>
            <div className="mt-3 small">
              {summary.customersWithActiveLoans} customers with active loans
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col md={3} sm={6} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Body className="bg-danger text-white rounded">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="text-white-50">Overdue Amount</h6>
                <h3 className="mb-0">₹{summary.overdueAmount.toFixed(2)}</h3>
              </div>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-white-50" />
            </div>
            <div className="mt-3 small">
              {summary.overdueLoanCount} loans overdue
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;