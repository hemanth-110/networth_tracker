import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import CustomerDetail from './components/customers/CustomerDetail';
import LoanList from './components/loans/LoanList';
import LoanForm from './components/loans/LoanForm';
import LoanDetail from './components/loans/LoanDetail';
import RepaymentList from './components/repayments/RepaymentList';
import RepaymentForm from './components/repayments/RepaymentForm';
import Summary from './components/summary/Summary';
import PrivateRoute from './components/common/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <main className="flex-grow-1 py-3">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/customers" 
                element={
                  <PrivateRoute>
                    <CustomerList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/customers/new" 
                element={
                  <PrivateRoute>
                    <CustomerForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/customers/:id" 
                element={
                  <PrivateRoute>
                    <CustomerDetail />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/customers/:id/edit" 
                element={
                  <PrivateRoute>
                    <CustomerForm isEdit={true} />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/loans" 
                element={
                  <PrivateRoute>
                    <LoanList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/loans/new" 
                element={
                  <PrivateRoute>
                    <LoanForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/loans/:id" 
                element={
                  <PrivateRoute>
                    <LoanDetail />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/repayments" 
                element={
                  <PrivateRoute>
                    <RepaymentList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/repayments/new" 
                element={
                  <PrivateRoute>
                    <RepaymentForm />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/summary" 
                element={
                  <PrivateRoute>
                    <Summary />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
          <footer className="py-3 bg-light mt-auto">
            <Container className="text-center">
              <p className="text-muted mb-0">
                &copy; {new Date().getFullYear()} CrediKhaata - Loan Tracker for Shopkeepers
              </p>
            </Container>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;