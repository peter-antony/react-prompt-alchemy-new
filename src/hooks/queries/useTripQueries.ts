
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripService } from '@/api/services';
import { QueryParams, TripCreateInput, TripUpdateInput } from '@/api/types';
import { useToast } from '@/hooks/use-toast';

// Query keys for consistent caching
export const tripQueryKeys = {
  all: ['trips'] as const,
  lists: () => [...tripQueryKeys.all, 'list'] as const,
  list: (params?: QueryParams) => [...tripQueryKeys.lists(), params] as const,
  details: () => [...tripQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tripQueryKeys.details(), id] as const,
};

// Get trips with filtering, sorting, and pagination
export const useTrips = (params?: QueryParams) => {
  return useQuery({
    queryKey: tripQueryKeys.list(params),
    queryFn: () => tripService.getTrips(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Get single trip
export const useTrip = (id: string) => {
  return useQuery({
    queryKey: tripQueryKeys.detail(id),
    queryFn: () => tripService.getTrip(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create trip mutation
export const useCreateTrip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TripCreateInput) => tripService.createTrip(data),
    onSuccess: (response) => {
      // Invalidate and refetch trips list
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to create trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    },
  });
};

// Update trip mutation
export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TripUpdateInput }) => 
      tripService.updateTrip(id, data),
    onSuccess: (response, { id }) => {
      // Update specific trip in cache
      queryClient.setQueryData(tripQueryKeys.detail(id), response);
      
      // Invalidate trips list to reflect changes
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      
      toast({
        title: "Success",
        description: "Trip updated successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to update trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
    },
  });
};

// Delete trip mutation
export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => tripService.deleteTrip(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: tripQueryKeys.detail(id) });
      
      // Invalidate trips list
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      
      toast({
        title: "Success",
        description: "Trip deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to delete trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    },
  });
};

// Approve trip mutation
export const useApproveTrip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => tripService.approveTrip(id),
    onSuccess: (response, id) => {
      // Update specific trip in cache
      queryClient.setQueryData(tripQueryKeys.detail(id), response);
      
      // Invalidate trips list to reflect status change
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.lists() });
      
      toast({
        title: "Success",
        description: "Trip approved successfully",
      });
    },
    onError: (error) => {
      console.error('Failed to approve trip:', error);
      toast({
        title: "Error",
        description: "Failed to approve trip",
        variant: "destructive",
      });
    },
  });
};
