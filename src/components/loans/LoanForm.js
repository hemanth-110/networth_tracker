"use client"

import { useState, useEffect } from "react"
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useParams, Link, useLocation } from "react-router-dom"
import { Formik } from "formik"
import * as Yup from "yup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { addDays, format } from "date-fns"
import LoanService from "../../services/loan.service"
import CustomerService from "../../services/customer.service"
import Spinner from "../common/Spinner"

const validationSchema = Yup.object().shape({
  customer: Yup.string().required("Customer is required"),
  description: Yup.string().required("Description is required").min(3, "Description must be at least 3 characters"),
  amount: Yup.number().required("Amount is required").min(1, "Amount must be greater than 0"),
  issueDate: Yup.date().required("Issue date is required"),
  dueDate: Yup.date().required("Due date is required").min(Yup.ref("issueDate"), "Due date must be after issue date"),
  gracePeriod: Yup.number().required("Grace period is required").min(0, "Grace period must be a positive number"),
  interestRate: Yup.number().required("Interest rate is required").min(0, "Interest rate must be a positive number"),
})

const LoanForm = ({ isEdit = false }) => {
  const [loan, setLoan] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const preselectedCustomerId = queryParams.get("customerId")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch customers for dropdown
        const customersData = await CustomerService.getAll()
        setCustomers(customersData)

        // If editing, fetch loan data
        if (isEdit && id) {
          const loanData = await LoanService.getById(id)
          setLoan(loanData)
        }
      } catch (err) {
        setError("Failed to load data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isEdit, id])

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await LoanService.update(id, values)
      } else {
        await LoanService.create(values)
      }
      navigate("/loans")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save loan")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  // Format dates for the form
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    return format(new Date(dateString), "yyyy-MM-dd")
  }

  const today = format(new Date(), "yyyy-MM-dd")
  const defaultDueDate = format(addDays(new Date(), 30), "yyyy-MM-dd")

  const initialValues =
    isEdit && loan
      ? {
          customer: loan.customer._id || "",
          description: loan.description || "",
          amount: loan.amount || 0,
          issueDate: formatDateForInput(loan.issueDate),
          dueDate: formatDateForInput(loan.dueDate),
          gracePeriod: loan.gracePeriod || 7,
          interestRate: loan.interestRate || 0,
          notes: loan.notes || "",
        }
      : {
          customer: preselectedCustomerId || "",
          description: "",
          amount: 0,
          issueDate: today,
          dueDate: defaultDueDate,
          gracePeriod: 7,
          interestRate: 0,
          notes: "",
        }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? "Edit Loan" : "Create New Loan"}</h2>
        <Link to="/loans" className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Loans
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
            {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer</Form.Label>
                  <Form.Select
                    name="customer"
                    value={values.customer}
                    onChange={handleChange}
                    isInvalid={touched.customer && !!errors.customer}
                    disabled={isEdit}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.customer}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    isInvalid={touched.description && !!errors.description}
                    placeholder="Enter loan description"
                  />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={values.amount}
                        onChange={handleChange}
                        isInvalid={touched.amount && !!errors.amount}
                        placeholder="Enter loan amount"
                      />
                      <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Issue Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="issueDate"
                        value={values.issueDate}
                        onChange={handleChange}
                        isInvalid={touched.issueDate && !!errors.issueDate}
                      />
                      <Form.Control.Feedback type="invalid">{errors.issueDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Due Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={values.dueDate}
                        onChange={handleChange}
                        isInvalid={touched.dueDate && !!errors.dueDate}
                      />
                      <Form.Control.Feedback type="invalid">{errors.dueDate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Grace Period (days)</Form.Label>
                      <Form.Control
                        type="number"
                        name="gracePeriod"
                        value={values.gracePeriod}
                        onChange={handleChange}
                        isInvalid={touched.gracePeriod && !!errors.gracePeriod}
                      />
                      <Form.Control.Feedback type="invalid">{errors.gracePeriod}</Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Additional days after due date before loan is marked overdue
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Interest Rate (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="interestRate"
                        value={values.interestRate}
                        onChange={handleChange}
                        isInvalid={touched.interestRate && !!errors.interestRate}
                      />
                      <Form.Control.Feedback type="invalid">{errors.interestRate}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Annual interest rate (0 for interest-free loans)</Form.Text>
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
                    placeholder="Any additional notes about this loan"
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    {isSubmitting ? "Saving..." : "Save Loan"}
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

export default LoanForm
