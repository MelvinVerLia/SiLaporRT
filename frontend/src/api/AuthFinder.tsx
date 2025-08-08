import axios from "axios";

export const AuthFinder = axios.create({
    baseURL: "http://localhost:5000/api/auth",
});