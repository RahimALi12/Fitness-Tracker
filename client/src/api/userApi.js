// import axios from 'axios';
import axios from '../../utils/axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/users' });

export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);
