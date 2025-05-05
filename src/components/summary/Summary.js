"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Table, Badge, Nav } from "react-bootstrap"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChartBar,
  faExclamationTriangle,
  faMoneyBillWave,
  faCalendarAlt,
  faUserFriends,
  faHandHoldingUsd,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons"
import { format } from "date-fns"
import SummaryService from "../../services/summary.service"
import SummaryCards from "../dashboard/SummaryCards"
import MonthlyChart from "./MonthlyChart"
import Spinner from "../common/Spinner"
import Alert from "../common/Alert"

const Summary = () => {
  const [summary, setSummary] = useState(null)
  const [overdueLoans, setOverdueLoans] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true)

        // Fetch summary overview
        const summaryData = await SummaryService.getOverview()
        setSummary(summaryData)

        // Fetch overdue loans
        const overdueData = await SummaryService.getOverdue()
        setOverdueLoans(overdueData)

        // Fetch monthly data
        const monthlyData = await SummaryService.getMonthly()
        setMonthlyData(monthlyData)
      } catch (err) {
        setError("Failed to load summary data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryData()
  }, [])

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
      <h2 className="mb-4">Business Summary</h2>

      {summary && <SummaryCards summary={summary} />}

      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-white">
          <Nav variant="tabs" className="card-header-tabs">
            <Nav.Item>
              <Nav.Link
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                className="text-decoration-none"
              >
                <FontAwesomeIcon icon={faChartBar} className="me-1" /> Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "overdue"}
                onClick={() => setActiveTab("overdue")}
                className="text-decoration-none"
              >
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" /> Overdue Loans
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={activeTab === "monthly"}
                onClick={() => setActiveTab("monthly")}
                className="text-decoration-none"
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" /> Monthly Analysis
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {activeTab === "overview" && (
            <div>
              <h5 className="mb-3">Business Metrics</h5>
              <Row>
                <Col md={6}>
                  <Card className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Loan Statistics</h6>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>Total Loans</td>
                            <td className="text-end fw-bold">{summary.loanCount}</td>
                          </tr>
                          <tr>
                            <td>Fully Paid Loans</td>
                            <td className="text-end fw-bold">{summary.paidLoanCount}</td>
                          </tr>
                          <tr>
                            <td>Partially Paid Loans</td>
                            <td className="text-end fw-bold">{summary.partialLoanCount}</td>
                          </tr>
                          <tr>
                            <td>Pending Loans</td>
                            <td className="text-end fw-bold">{summary.pendingLoanCount}</td>
                          </tr>
                          <tr>
                            <td>Overdue Loans</td>
                            <td className="text-end fw-bold text-danger">{summary.overdueLoanCount}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Financial Metrics</h6>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>Average Repayment Time</td>
                            <td className="text-end fw-bold">{summary.avgRepaymentTime} days</td>
                          </tr>
                          <tr>
                            <td>Customers with Active Loans</td>
                            <td className="text-end fw-bold">{summary.customersWithActiveLoans}</td>
                          </tr>
                          <tr>
                            <td>Collection Rate</td>
                            <td className="text-end fw-bold">
                              {summary.totalLoaned > 0
                                ? `${((summary.totalCollected / summary.totalLoaned) * 100).toFixed(1)}%`
                                : "0%"}
                            </td>
                          </tr>
                          <tr>
                            <td>Outstanding Rate</td>
                            <td className="text-end fw-bold">
                              {summary.totalLoaned > 0
                                ? `${((summary.totalOutstanding / summary.totalLoaned) * 100).toFixed(1)}%`
                                : "0%"}
                            </td>
                          </tr>
                          <tr>
                            <td>Overdue Rate</td>
                            <td className="text-end fw-bold text-danger">
                              {summary.totalOutstanding > 0
                                ? `${((summary.overdueAmount / summary.totalOutstanding) * 100).toFixed(1)}%`
                                : "0%"}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {activeTab === "overdue" && (
            <div>
              <h5 className="mb-3">Overdue Loans</h5>
              {overdueLoans.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-success">No overdue loans! All your customers are paying on time.</p>
                </div>
              ) : (
                <div>
                  {overdueLoans.map((item, index) => (
                    <Card key={index} className="mb-3 border-0 shadow-sm">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="mb-1">
                              <Link to={`/customers/${item.customer._id}`} className="text-decoration-none">
                                {item.customer.name}
                              </Link>
                            </h5>
                            <p className="text-muted mb-0">{item.customer.phone}</p>
                          </div>
                          <div className="text-end">
                            <h5 className="text-danger mb-1">₹{item.totalOverdue.toFixed(2)}</h5>
                            <Badge bg="danger">{item.loans.length} overdue loans</Badge>
                          </div>
                        </div>

                        <Table responsive hover size="sm">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th>Due Date</th>
                              <th>Days Overdue</th>
                              <th>Balance</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.loans.map((loan) => (
                              <tr key={loan.id}>
                                <td>
                                  <Link to={`/loans/${loan.id}`} className="text-decoration-none">
                                    {loan.description}
                                  </Link>
                                </td>
                                <td>{format(new Date(loan.dueDate), "dd MMM yyyy")}</td>
                                <td className="text-danger">{loan.daysOverdue} days</td>
                                <td>₹{loan.balance.toFixed(2)}</td>
                                <td>
                                  <Link
                                    to={`/repayments/new?loanId=${loan.id}`}
                                    className="btn btn-sm btn-outline-success"
                                  >
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Collect
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "monthly" && (
            <div>
              <h5 className="mb-3">Monthly Analysis</h5>
              <MonthlyChart data={monthlyData} />

              <Table responsive className="mt-4">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>
                      <FontAwesomeIcon icon={faHandHoldingUsd} className="me-1 text-primary" />
                      Loaned
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faMoneyBillWave} className="me-1 text-success" />
                      Collected
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faUserFriends} className="me-1 text-info" />
                      New Loans
                    </th>
                    <th>
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1 text-success" />
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td>₹{month.loaned.toFixed(2)}</td>
                      <td>₹{month.collected.toFixed(2)}</td>
                      <td>{month.newLoans}</td>
                      <td>{month.completedLoans}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Summary
