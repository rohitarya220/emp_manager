import axios from "axios";
const instance = axios.create({
    baseURL: "https://ppm-api.cludocloud.com/Auth/"
});

export default instance;