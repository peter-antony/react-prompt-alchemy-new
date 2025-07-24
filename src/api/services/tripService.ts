
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse, PaginatedResponse, QueryParams, Trip, TripCreateInput, TripUpdateInput } from '../types';

export const tripService = {
  // Get trips with filtering, sorting, and pagination
  getTrips: async (params?: QueryParams): Promise<PaginatedResponse<Trip>> => {
    const response = await apiClient.get(API_ENDPOINTS.TRIPS.LIST, { params });
    return response.data;
  },

  // Get single trip
  getTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.TRIPS.LIST}/${id}`);
    return response.data;
  },

  // Create new trip
  createTrip: async (data: TripCreateInput): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.CREATE, data);
    return response.data;
  },

  // Update trip
  updateTrip: async (id: string, data: TripUpdateInput): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.put(API_ENDPOINTS.TRIPS.UPDATE(id), data);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(API_ENDPOINTS.TRIPS.DELETE(id));
    return response.data;
  },

  // Approve trip
  approveTrip: async (id: string): Promise<ApiResponse<Trip>> => {
    const response = await apiClient.post(API_ENDPOINTS.TRIPS.APPROVE(id));
    return response.data;
  },
};
