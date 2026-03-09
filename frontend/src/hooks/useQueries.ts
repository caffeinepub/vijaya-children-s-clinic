import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AppointmentRequest, AppointmentStatus, UserProfile, UserRole } from '../backend';

export function useCreateAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AppointmentRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAppointment(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useListAppointments() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<AppointmentRequest[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      console.log('[useListAppointments] Starting query, actor available:', !!actor);
      if (!actor) {
        console.log('[useListAppointments] No actor available, throwing error');
        throw new Error('Actor not available');
      }
      
      try {
        console.log('[useListAppointments] Calling listAppointments...');
        const result = await actor.listAppointments();
        console.log('[useListAppointments] Success! Received appointments:', result.length);
        return result;
      } catch (error) {
        console.error('[useListAppointments] Error fetching appointments:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: (failureCount, error) => {
      console.log('[useListAppointments] Retry attempt:', failureCount, 'Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
        console.log('[useListAppointments] Authorization error, not retrying');
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  console.log('[useListAppointments] Query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error?.toString(),
    dataLength: query.data?.length,
    actorFetching,
  });

  return query;
}

export function useUpdateAppointmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, status }: { index: bigint; status: AppointmentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppointmentStatus(index, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
