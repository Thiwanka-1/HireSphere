import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Pointing straight to your Docker API Gateway!
    withCredentials: true // MANDATORY: This tells the browser to send/receive the JWT cookie
});

export default api;