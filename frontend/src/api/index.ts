import axios from "axios";
import { Brand, BrandDetailResponse, ChatApiResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const createBrand = (name: string) => api.post<Brand>("/brands", { name }).then((response) => response.data);

export const fetchBrands = () => api.get<Brand[]>("/brands").then((response) => response.data);

export const fetchBrandById = (id: string) =>
  api.get<BrandDetailResponse>(`/brands/${id}`).then((response) => response.data);

export const sendMessage = (brand_id: string, message: string) =>
  api.post<ChatApiResponse>("/chat", { brand_id, message }).then((response) => response.data);
