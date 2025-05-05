"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Alert } from "react-bootstrap"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faEdit,
  faArrowLeft,
  faMoneyBillWave,
  faCalendarAlt,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { format, differenceInDays, isPast, addDays } from "date-fns"
import LoanService from "../../services/loan.service"
import RepaymentService from "../../services/repayment.service"
import Spinner from "../common/Spinner"

const LoanDetail = () => {
  const [loan, setLoan] = useState(null)
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        setLoading(true)
        const loanData = await LoanService.getById(id)
        setLoan(loanData)

        // Fetch repayments for this loan
        const repaymentsData = await RepaymentService.getAll({ loanId: id })
        setRepayments(repaymentsData)
      } catch (err) {
        setError("Failed to load loan data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLoanData()
  }, [id])

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

  if (!loan) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Loan not found</Alert>
      </Container>
    )
  }

  // Calculate days overdue or days remaining
  const today = new Date()
  const dueDate = new Date(loan.dueDate)
  const dueDateWithGrace = addDays(dueDate, loan.gracePeriod)
  const isOverdue = isPast(dueDateWithGrace) && loan.balance > 0
  const daysOverdue = isOverdue ? differenceInDays(today, dueDateWithGrace) : 0
  const daysRemaining = !isOverdue ? differenceInDays(dueDateWithGrace, today) : 0

  // Calculate repayment progress
  const repaymentProgress = ((loan.amount - loan.balance) / loan.amount) * 100

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Loan Details</h2>
        <Link to="/loans" className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Loans
        </Link>
      </div>

      <Row>
        <Col lg={4} md={5}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">{loan.description}</h4>

              <div className="mb-3">
                <Badge
                  bg={
                    loan.status === "paid"
                      ? "success"
                      : loan.status === "partial"
                        ? "warning"
                        : loan.status === "overdue"
                          ? "danger"
                          : "primary"
                  }
                  className="px-3 py-2"
                >
                  {loan.status === "paid" && "Paid"}
                  {loan.status === "partial" && "Partially Paid"}
                  {loan.status === "overdue" && "Overdue"}
                  {loan.status === "pending" && "Pending"}
                </Badge>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <span>Repayment Progress</span>
                  <span>{Math.round(repaymentProgress)}%</span>
                </div>
                <div className="progress" style={{ height: "10px" }}>
                  <div
                    className={`progress-bar ${
                      loan.status === "paid"
                        ? "bg-success"
                        : loan.status === "partial"
                          ? "bg-warning"
                          : loan.status === "overdue"
                            ? "bg-danger"
                            : "bg-primary"
                    }`}
                    style={{ width: `${repaymentProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Customer:</span>
                <Link to={`/customers/${loan.customer._id}`} className="text-decoration-none">
                  {loan.customer.name}
                </Link>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Amount:</span>
                <span className="fw-bold">₹{loan.amount.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Balance:</span>
                <span className="fw-bold">₹{loan.balance.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Issue Date:</span>
                <span>{format(new Date(loan.issueDate), "dd MMM yyyy")}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Due Date:</span>
                <span>{format(new Date(loan.dueDate), "dd MMM yyyy")}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Grace Period:</span>
                <span>{loan.gracePeriod} days</span>
              </div>

              {loan.interestRate > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Interest Rate:</span>
                  <span>{loan.interestRate}% per annum</span>
                </div>
              )}

              <hr />

              {isOverdue && loan.balance > 0 ? (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  <div>
                    <strong>Overdue by {daysOverdue} days</strong>
                    <div className="small">Due date was {format(dueDate, "dd MMM yyyy")}</div>
                  </div>
                </div>
              ) : loan.balance > 0 ? (
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  <div>
                    <strong>{daysRemaining} days remaining</strong>
                    <div className="small">Due date is {format(dueDate, "dd MMM yyyy")}</div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>
                    <strong>Loan fully paid</strong>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2 mt-4">
                {loan.balance > 0 && (
                  <Link to={`/repayments/new?loanId=${loan._id}`} className="btn btn-success">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Record Payment
                  </Link>
                )}
                <Link to={`/loans/${loan._id}/edit`} className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faEdit} className="me-1" /> Edit Loan
                </Link>
              </div>
            </Card.Body>
          </Card>

          {loan.notes && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Notes</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{loan.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={8} md={7}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Payment History</h5>
              {loan.balance > 0 && (
                <Link to={`/repayments/new?loanId=${loan._id}`} className="btn btn-sm btn-primary">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> New Payment
                </Link>
              )}
            </Card.Header>
            <Card.Body>
              {repayments.length === 0 ? (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faInfoCircle} size="2x" className="text-muted mb-3" />
                  <p className="text-muted">No payment history found for this loan.</p>
                  {loan.balance > 0 && (
                    <Link to={`/repayments/new?loanId=${loan._id}`} className="btn btn-primary">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Record First Payment
                    </Link>
                  )}
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Notes</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repayments.map((repayment) => (
                      <tr key={repayment._id}>
                        <td>{format(new Date(repayment.paymentDate), "dd MMM yyyy")}</td>
                        <td>₹{repayment.amount.toFixed(2)}</td>
                        <td>{repayment.notes || "-"}</td>
                        <td>
                          <Link to={`/repayments/${repayment._id}/receipt`} className="btn btn-sm btn-outline-primary">
                            View Receipt
                          </Link>
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
    </Container>
  )
}

export default LoanDetail
