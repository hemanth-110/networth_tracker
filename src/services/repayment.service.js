import api from './api';

const RepaymentService = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await api.get(`/repayments?${queryParams}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/repayments/${id}`);
    return response.data;
  },
  
  create: async (repaymentData) => {
    const response = await api.post('/repayments', repaymentData);
    return response.data;
  },
  
  generateReceipt: async (id) => {
    const response = await api.get(`/repayments/${id}/receipt`);
    return response.data;
  }
};

export default RepaymentService;