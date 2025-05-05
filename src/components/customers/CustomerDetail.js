"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Modal } from "react-bootstrap"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEdit,
  faTrash,
  faArrowLeft,
  faHandHoldingUsd,
  faMoneyBillWave,
  faPhone,
  faMapMarkerAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons"
import CustomerService from "../../services/customer.service"
import Spinner from "../common/Spinner"

const CustomerDetail = () => {
  const [customer, setCustomer] = useState(null)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true)
        const customerData = await CustomerService.getById(id)
        setCustomer(customerData)

        const loansData = await CustomerService.getLoans(id)
        setLoans(loansData)
      } catch (err) {
        setError("Failed to load customer data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [id])

  const handleDelete = async () => {
    try {
      await CustomerService.delete(id)
      navigate("/customers")
    } catch (err) {
      setError("Failed to delete customer")
      console.error(err)
    }
    setShowDeleteModal(false)
  }

  if (loading) {
    return <Spinner fullPage />
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }

  if (!customer) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Customer not found</Alert>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customer Details</h2>
        <Link to="/customers" className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Customers
        </Link>
      </div>

      <Row>
        <Col lg={4} md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <div className="text-center mb-3">
                <div
                  className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center"
                  style={{ width: "100px", height: "100px" }}
                >
                  <h1 className="mb-0 text-primary">{customer.name.charAt(0)}</h1>
                </div>
                <h3 className="mt-3">{customer.name}</h3>

                <div className="d-flex justify-content-center mt-2">
                  <Link to={`/customers/${customer._id}/edit`} className="btn btn-sm btn-outline-primary me-2">
                    <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit
                  </Link>
                  <Button variant="sm btn-outline-danger" onClick={() => setShowDeleteModal(true)}>
                    <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
                  </Button>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                  <div>{customer.phone}</div>
                </div>

                {customer.address && (
                  <div className="d-flex align-items-start mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-muted mt-1" />
                    <div>{customer.address}</div>
                  </div>
                )}
              </div>

              <hr />

              <div className="mb-3">
                <h6>Trust Score</h6>
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1" style={{ height: "10px" }}>
                    <div
                      className={`progress-bar ${
                        customer.trustScore >= 7 ? "bg-success" : customer.trustScore >= 4 ? "bg-warning" : "bg-danger"
                      }`}
                      style={{ width: `${customer.trustScore * 10}%` }}
                    ></div>
                  </div>
                  <span className="ms-2 fw-bold">{customer.trustScore}/10</span>
                </div>
              </div>

              <div className="mb-3">
                <h6>Credit Limit</h6>
                <div className="d-flex align-items-center">
                  <div className="progress flex-grow-1" style={{ height: "10px" }}>
                    <div
                      className="bg-info progress-bar"
                      style={{
                        width: `${Math.min(100, (customer.totalOutstanding / customer.creditLimit) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="ms-2 fw-bold">
                    ₹{customer.totalOutstanding.toFixed(2)} / ₹{customer.creditLimit.toFixed(2)}
                  </span>
                </div>
              </div>

              {customer.notes && (
                <div className="mt-4">
                  <h6>Notes</h6>
                  <p className="text-muted">{customer.notes}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} md={7}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Loans</h5>
              <Link to={`/loans/new?customerId=${customer._id}`} className="btn btn-sm btn-primary">
                <FontAwesomeIcon icon={faHandHoldingUsd} className="me-1" /> New Loan
              </Link>
            </Card.Header>
            <Card.Body>
              {loans.length === 0 ? (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faInfoCircle} size="2x" className="text-muted mb-3" />
                  <p className="text-muted">No loans found for this customer.</p>
                  <Link to={`/loans/new?customerId=${customer._id}`} className="btn btn-primary">
                    <FontAwesomeIcon icon={faHandHoldingUsd} className="me-1" /> Create First Loan
                  </Link>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Balance</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan._id}>
                        <td>{loan.description}</td>
                        <td>₹{loan.amount.toFixed(2)}</td>
                        <td>₹{loan.balance.toFixed(2)}</td>
                        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                        <td>
                          {loan.status === "overdue" && <Badge bg="danger">Overdue</Badge>}
                          {loan.status === "paid" && <Badge bg="success">Paid</Badge>}
                          {loan.status === "partial" && <Badge bg="warning">Partial</Badge>}
                          {loan.status === "pending" && <Badge bg="primary">Pending</Badge>}
                        </td>
                        <td>
                          <Link to={`/loans/${loan._id}`} className="btn btn-sm btn-outline-primary me-1">
                            View
                          </Link>
                          {loan.balance > 0 && (
                            <Link to={`/repayments/new?loanId=${loan._id}`} className="btn btn-sm btn-outline-success">
                              <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Repay
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete {customer.name}?</p>
          <p className="text-danger">
            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
            This action cannot be undone. All associated loans and repayments will also be deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default CustomerDetail
