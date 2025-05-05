"use client"

import { useState, useEffect } from "react"
import { Container, Card, Form, Button, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useParams, Link } from "react-router-dom"
import { Formik } from "formik"
import * as Yup from "yup"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import CustomerService from "../../services/customer.service"
import Spinner from "../common/Spinner"

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  phone: Yup.string().required("Phone number is required"),
  address: Yup.string(),
  creditLimit: Yup.number().required("Credit limit is required").min(0, "Credit limit must be a positive number"),
  trustScore: Yup.number()
    .required("Trust score is required")
    .min(1, "Trust score must be at least 1")
    .max(10, "Trust score must be at most 10"),
})

const CustomerForm = ({ isEdit = false }) => {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchCustomer = async () => {
      if (isEdit && id) {
        try {
          setLoading(true)
          const data = await CustomerService.getById(id)
          setCustomer(data)
        } catch (err) {
          setError("Failed to load customer data")
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchCustomer()
  }, [isEdit, id])

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await CustomerService.update(id, values)
      } else {
        await CustomerService.create(values)
      }
      navigate("/customers")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save customer")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  const initialValues =
    isEdit && customer
      ? {
          name: customer.name || "",
          phone: customer.phone || "",
          address: customer.address || "",
          creditLimit: customer.creditLimit || 0,
          trustScore: customer.trustScore || 5,
          notes: customer.notes || "",
        }
      : {
          name: "",
          phone: "",
          address: "",
          creditLimit: 5000,
          trustScore: 5,
          notes: "",
        }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? "Edit Customer" : "Add New Customer"}</h2>
        <Link to="/customers" className="btn btn-outline-secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back to Customers
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
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        isInvalid={touched.name && !!errors.name}
                        placeholder="Enter customer name"
                      />
                      <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        isInvalid={touched.phone && !!errors.phone}
                        placeholder="Enter phone number"
                      />
                      <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    isInvalid={touched.address && !!errors.address}
                    placeholder="Enter customer address"
                  />
                  <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Credit Limit (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        name="creditLimit"
                        value={values.creditLimit}
                        onChange={handleChange}
                        isInvalid={touched.creditLimit && !!errors.creditLimit}
                        placeholder="Enter credit limit"
                      />
                      <Form.Control.Feedback type="invalid">{errors.creditLimit}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Maximum amount this customer can borrow</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trust Score (1-10)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="10"
                        name="trustScore"
                        value={values.trustScore}
                        onChange={handleChange}
                        isInvalid={touched.trustScore && !!errors.trustScore}
                      />
                      <Form.Control.Feedback type="invalid">{errors.trustScore}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Rate how trustworthy this customer is</Form.Text>
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
                    placeholder="Any additional notes about this customer"
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    <FontAwesomeIcon icon={faSave} className="me-1" />
                    {isSubmitting ? "Saving..." : "Save Customer"}
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

export default CustomerForm
