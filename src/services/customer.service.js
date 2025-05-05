import api from './api';

const CustomerService = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  
  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  
  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
  
  getLoans: async (id) => {
    const response = await api.get(`/customers/${id}/loans`);
    return response.data;
  }
};

export default CustomerService;