import api from './api';

const LoanService = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/loans?${queryParams}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },
  
  create: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },
  
  update: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },
  
  getOverdue: async () => {
    const response = await api.get('/loans/status/overdue');
    return response.data;
  }
};

export default LoanService;