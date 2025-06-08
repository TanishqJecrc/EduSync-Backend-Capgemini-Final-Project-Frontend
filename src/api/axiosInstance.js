import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://edusynctanishq.azurewebsites.net/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
