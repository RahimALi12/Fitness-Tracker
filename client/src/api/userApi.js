// import axios from 'axios';
import axios from '../../utils/axios';

const API = axios.create({ baseURL: '/api/users' });

export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);
