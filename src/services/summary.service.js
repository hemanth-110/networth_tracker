import api from './api';

const SummaryService = {
  getOverview: async () => {
    const response = await api.get('/summary');
    return response.data;
  },
  
  getOverdue: async () => {
    const response = await api.get('/summary/overdue');
    return response.data;
  },
  
  getMonthly: async () => {
    const response = await api.get('/summary/monthly');
    return response.data;
  }
};

export default SummaryService;