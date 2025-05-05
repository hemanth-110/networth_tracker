import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import CustomerService from '../../services/customer.service';
import Spinner from '../common/Spinner';
import Alert from '../common/Alert';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await CustomerService.getAll();
        setCustomers(data);
      } catch (err) {
        setError('Failed to load customers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <Link to="/customers/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-1" /> Add Customer
        </Link>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          {filteredCustomers.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No customers found. Add your first customer to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Trust Score</th>
                  <th>Credit Limit</th>
                  <th>Outstanding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="progress flex-grow-1" 
                          style={{ height: '8px' }}
                        >
                          <div 
                            className={`progress-bar ${
                              customer.trustScore >= 7 ? 'bg-success' : 
                              customer.trustScore >= 4 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${customer.trustScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="ms-2">{customer.trustScore}/10</span>
                      </div>
                    </td>
                    <td>₹{customer.creditLimit.toFixed(2)}</td>
                    <td>
                      <span className={customer.totalOutstanding > 0 ? 'text-danger' : 'text-success'}>
                        ₹{customer.totalOutstanding.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <Link 
                        to={`/customers/${customer._id}`} 
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-1" /> View
                      </Link>
                      <Link 
                        to={`/customers/${customer._id}/edit`} 
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerList;