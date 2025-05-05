"use client"

import { useState, useEffect } from "react"
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Formik } from "formik"
import * as Yup from "yup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"
import LoanService from "../../services/loan.service"
import RepaymentService from "../../services/repayment.service"
import CustomerService from "../../services/customer.service"
import Spinner from "../common/Spinner"

const validationSchema = Yup.object().shape({
  loanId: Yup.string().required("Loan is required"),
  amount: Yup.number().required("Amount is required").min(1, "Amount must be greater than 0"),
  paymentDate: Yup.date().required("Payment date is required").max(new Date(), "Payment date cannot be in the future"),
})

const RepaymentForm = () => {
  const [loans, setLoans] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const preselectedLoanId = queryParams.get("loanId")
  const preselectedCustomerId = queryParams.get("customerId")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch customers for dropdown
        const customersData = await CustomerService.getAll()
        setCustomers(customersData)

        // Fetch loans
        let loansData
        if (preselectedCustomerId) {
          loansData = await CustomerService.getLoans(preselectedCustomerId)
        } else {
          loansData = await LoanService.getAll()
        }

        // Filter out fully paid loans
        const activeLoans = loansData.filter((loan) => loan.balance > 0)
        setLoans(activeLoans)

        // If a loan ID is preselected, fetch that loan's details
        if (preselectedLoanId) {
          const loanData = await LoanService.getById(preselectedLoanId)
          setSelectedLoan(loanData)
        }
      } catch (err) {
        setError("Failed to load data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [preselectedLoanId, preselectedCustomerId])

  const handleLoanChange = async (loanId) => {
    if (loanId) {
      try {
        const loanData = await LoanService.getById(loanId)
        setSelectedLoan(loanData)
      } catch (err) {
        console.error("Error fetching loan details:", err)
      }
    } else {
      setSelectedLoan(null)
    }
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await RepaymentService.create(values)
      navigate("/repayments")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save repayment")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  const today = format(new Date(), "yyyy-MM-dd")

  const initialValues = {
    loanId: preselectedLoanId || "",
    amount: selectedLoan ? Math.min(selectedLoan.balance, selectedLoan.amount) : 0,
    paymentDate: today,
    notes: "",
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Record Payment</h2>
        <Link to="/repayments" className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Repayments
        </Link>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ handleSubmit, handleChange, values, touched, errors, isSubmitting, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Loan</Form.Label>
                  <Form.Select
                    name="loanId"
                    value={values.loanId}
                    onChange={(e) => {
                      handleChange(e)
                      handleLoanChange(e.target.value)
                      // Reset amount when loan changes
                      if (e.target.value) {
                        const loan = loans.find((l) => l._id === e.target.value)
                        if (loan) {
                          setFieldValue("amount", Math.min(loan.balance, loan.amount))
                        }
                      } else {
                        setFieldValue("amount", 0)
                      }
                    }}
                    isInvalid={touched.loanId && !!errors.loanId}
                  >
                    <option value="">Select a loan</option>
                    {loans.map((loan) => (
                      <option key={loan._id} value={loan._id}>
                        {loan.customer.name} - {loan.description} (Balance: ₹{loan.balance.toFixed(2)})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.loanId}</Form.Control.Feedback>
                </Form.Group>

                {selectedLoan && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6>Loan Details</h6>
                    <Row>
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Customer:</strong> {selectedLoan.customer.name}
                        </p>
                        <p className="mb-1">
                          <strong>Description:</strong> {selectedLoan.description}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p className="mb-1">
                          <strong>Total Amount:</strong> ₹{selectedLoan.amount.toFixed(2)}
                        </p>
                        <p className="mb-1">
                          <strong>Remaining Balance:</strong> ₹{selectedLoan.balance.toFixed(2)}
                        </p>
                      </Col>
                    </Row>
                  </div>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Amount (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={values.amount}
                        onChange={handleChange}
                        isInvalid={touched.amount && !!errors.amount}
                        placeholder="Enter payment amount"
                        max={selectedLoan ? selectedLoan.balance : undefined}
                      />
                      <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                      {selectedLoan && (
                        <Form.Text className="text-muted">
                          Maximum payment: ₹{selectedLoan.balance.toFixed(2)}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="paymentDate"
                        value={values.paymentDate}
                        onChange={handleChange}
                        isInvalid={touched.paymentDate && !!errors.paymentDate}
                        max={today}
                      />
                      <Form.Control.Feedback type="invalid">{errors.paymentDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes about this payment"
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="primary" type="submit" disabled={isSubmitting || !selectedLoan}>
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    {isSubmitting ? "Saving..." : "Record Payment"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default RepaymentForm
