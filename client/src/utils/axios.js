// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  // Ab ye localhost ke bajaye Vercel ke relative path se connect karega
  baseURL: '/api', 
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
