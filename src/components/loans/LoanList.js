"use client"

import { useState, useEffect } from "react"
import { Container, Table, Button, Card, Form, InputGroup, Badge, Row, Col, Nav } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSearch, faEye, faMoneyBillWave, faFilter } from "@fortawesome/free-solid-svg-icons"
import LoanService from "../../services/loan.service"
import Spinner from "../common/Spinner"
import Alert from "../common/Alert"

const LoanList = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true)
        const data = await LoanService.getAll()
        setLoans(data)
      } catch (err) {
        setError("Failed to load loans")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const filteredLoans = loans.filter((loan) => {
    // Filter by search term
    const matchesSearch =
      loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by status tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "overdue") return loan.status === "overdue" && matchesSearch
    if (activeTab === "pending") return loan.status === "pending" && matchesSearch
    if (activeTab === "partial") return loan.status === "partial" && matchesSearch
    if (activeTab === "paid") return loan.status === "paid" && matchesSearch

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
        <h2>Loans</h2>
        <Link to="/loans/new" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-1" /> New Loan
        </Link>
      </div>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by description or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                <Button variant="outline-secondary">
                  <FontAwesomeIcon icon={faFilter} className="me-1" /> Filter
                </Button>
              </div>
            </Col>
          </Row>

          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                All
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "overdue"}
                onClick={() => setActiveTab("overdue")}
                className="text-danger"
              >
                Overdue
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
                className="text-primary"
              >
                Pending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "partial"}
                onClick={() => setActiveTab("partial")}
                className="text-warning"
              >
                Partial
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={activeTab === "paid"} onClick={() => setActiveTab("paid")} className="text-success">
                Paid
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {filteredLoans.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">No loans found. Add your first loan to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <Link to={`/customers/${loan.customer._id}`} className="text-decoration-none">
                        {loan.customer.name}
                      </Link>
                    </td>
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
                        <FontAwesomeIcon icon={faEye} className="me-1" /> View
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
    </Container>
  )
}

export default LoanList
