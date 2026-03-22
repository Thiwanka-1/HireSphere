import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-gateway.agreeablewave-5261b6ec.centralindia.azurecontainerapps.io/api', 
    withCredentials: true // MANDATORY: This tells the browser to send/receive the JWT cookie
});

export default api;