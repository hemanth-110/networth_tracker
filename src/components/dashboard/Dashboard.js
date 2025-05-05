import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileInvoice, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import SummaryService from '../../services/summary.service';
import LoanService from '../../services/loan.service';
import RepaymentService from '../../services/repayment.service';
import SummaryCards from './SummaryCards';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentRepayments, setRecentRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary data
        const summaryData = await SummaryService.getOverview();
        setSummary(summaryData);
        
        // Fetch recent loans
        const loansData = await LoanService.getAll();
        setRecentLoans(loansData.slice(0, 5));
        
        // Fetch recent repayments
        const repaymentsData = await RepaymentService.getAll();
        setRecentRepayments(repaymentsData.slice(0, 5));
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner fullPage />;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" message={error} />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Dashboard</h2>
      
      {summary && <SummaryCards summary={summary} />}
      
      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="mb-0">Recent Loans</h5>
              <Link to="/loans/new" className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faPlus} className="me-1" /> New Loan
              </Link>
            </Card.Header>
            <Card.Body>
              {recentLoans.length === 0 ? (
                <p className="text-center text-muted">No recent loans found.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map(loan => (
                      <tr key={loan._id}>
                        <td>
                          <Link to={`/customers/${loan.customer._id}`} className="text-decoration-none">
                            {loan.customer.name}
                          </Link>
                        </td>
                        <td>₹{loan.amount.toFixed(2)}</td>
                        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                        <td>
                          {loan.status === 'overdue' && (
                            <Badge bg="danger">Overdue</Badge>
                          )}
                          {loan.status === 'paid' && (
                            <Badge bg="success">Paid</Badge>
                          )}
                          {loan.status === 'partial' && (
                            <Badge bg="warning">Partial</Badge>
                          )}
                          {loan.status === 'pending' && (
                            <Badge bg="primary">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer className="text-center bg-white">
              <Link to="/loans" className="text-decoration-none">View All Loans</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white">
              <h5 className="mb-0">Recent Repayments</h5>
              <Link to="/repayments/new" className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faPlus} className="me-1" /> New Repayment
              </Link>
            </Card.Header>
            <Card.Body>
              {recentRepayments.length === 0 ? (
                <p className="text-center text-muted">No recent repayments found.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRepayments.map(repayment => (
                      <tr key={repayment._id}>
                        <td>
                          <Link to={`/customers/${repayment.customer._id}`} className="text-decoration-none">
                            {repayment.customer.name}
                          </Link>
                        </td>
                        <td>₹{repayment.amount.toFixed(2)}</td>
                        <td>{new Date(repayment.paymentDate).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/repayments/${repayment._id}/receipt`} className="btn btn-sm btn-outline-primary">
                            <FontAwesomeIcon icon={faFileInvoice} className="me-1" /> Receipt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer className="text-center bg-white">
              <Link to="/repayments" className="text-decoration-none">View All Repayments</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;