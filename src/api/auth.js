import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const superUserLogin = (username, password) =>
  api.post('/api/superuser-login/', { username, password });