"use client"

import { useState, useEffect } from "react"
import { Container, Table, Button, Card, Form, InputGroup, Row, Col } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSearch, faFileInvoice, faFilter, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"
import RepaymentService from "../../services/repayment.service"
import Spinner from "../common/Spinner"
import Alert from "../common/Alert"

const RepaymentList = () => {
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const fetchRepayments = async () => {
      try {
        setLoading(true)
        const data = await RepaymentService.getAll()
        setRepayments(data)
      } catch (err) {
        setError("Failed to load repayments")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRepayments()
  }, [])

  const filteredRepayments = repayments.filter((repayment) => {
    // Filter by search term
    const matchesSearch =
      repayment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repayment.loan.description && repayment.loan.description.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filter by date
    const paymentDate = new Date(repayment.paymentDate)
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))

    // Get the first day of the current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get the first day of the current week (Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    if (dateFilter === "today") {
      return matchesSearch && paymentDate >= startOfToday
    } else if (dateFilter === "week") {
      return matchesSearch && paymentDate >= startOfWeek
    } else if (dateFilter === "month") {
      return matchesSearch && paymentDate >= startOfMonth
    } else if (dateFilter === "custom") {
      const startDate = customDateRange.startDate ? new Date(customDateRange.startDate) : null
      const endDate = customDateRange.endDate ? new Date(customDateRange.endDate) : null

      if (startDate && endDate) {
        endDate.setHours(23, 59, 59, 999) // End of the selected end date
        return matchesSearch && paymentDate >= startDate && paymentDate <= endDate
      } else if (startDate) {
        return matchesSearch && paymentDate >= startDate
      } else if (endDate) {
        endDate.setHours(23, 59, 59, 999)
        return matchesSearch && paymentDate <= endDate
      }
    }

    return matchesSearch
  })

  if (loading) {
    return <Spinner fullPage />
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" message={error} />
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Repayments</h2>
        <Link to="/repayments/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-1" /> New Repayment
        </Link>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by customer or loan description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="mb-2 mb-md-0"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="custom">Custom Range</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <div className="d-flex justify-content-md-end">
                    <Button variant="outline-secondary">
                      <FontAwesomeIcon icon={faFilter} className="me-1" /> Filter
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {dateFilter === "custom" && (
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {filteredRepayments.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No repayments found. Record your first repayment to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Loan</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepayments.map((repayment) => (
                  <tr key={repayment._id}>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-muted" />
                      {format(new Date(repayment.paymentDate), "dd MMM yyyy")}
                    </td>
                    <td>
                      <Link to={`/customers/${repayment.customer._id}`} className="text-decoration-none">
                        {repayment.customer.name}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/loans/${repayment.loan._id}`} className="text-decoration-none">
                        {repayment.loan.description}
                      </Link>
                    </td>
                    <td>₹{repayment.amount.toFixed(2)}</td>
                    <td>{repayment.notes || "-"}</td>
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
      </Card>
    </Container>
  )
}

export default RepaymentList
