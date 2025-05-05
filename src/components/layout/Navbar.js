import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt, 
  faTachometerAlt, 
  faUsers, 
  faHandHoldingUsd, 
  faMoneyBillWave, 
  faChartBar 
} from '@fortawesome/free-solid-svg-icons';

const AppNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          CrediKhaata
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/customers">
                <FontAwesomeIcon icon={faUsers} className="me-1" /> Customers
              </Nav.Link>
              <Nav.Link as={Link} to="/loans">
                <FontAwesomeIcon icon={faHandHoldingUsd} className="me-1" /> Loans
              </Nav.Link>
              <Nav.Link as={Link} to="/repayments">
                <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> Repayments
              </Nav.Link>
              <Nav.Link as={Link} to="/summary">
                <FontAwesomeIcon icon={faChartBar} className="me-1" /> Summary
              </Nav.Link>
            </Nav>
          )}
          
          <Nav>
            {currentUser ? (
              <NavDropdown 
                title={
                  <span>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {currentUser.name}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;