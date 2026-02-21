import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { AppointmentRequest, UserProfile, UserRole, AppointmentStatus } from '../backend';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
      console.log('[useListAppointments] Query function called', {
        actorAvailable: !!actor,
        timestamp: new Date().toISOString(),
      });

      if (!actor) {
        console.error('[useListAppointments] Actor not available in queryFn');
        throw new Error('Actor not available');
      }

      try {
        console.log('[useListAppointments] Calling actor.listAppointments()...');
        const appointments = await actor.listAppointments();
        console.log('[useListAppointments] Successfully fetched appointments', {
          count: appointments.length,
          appointments: appointments,
          timestamp: new Date().toISOString(),
        });
        return appointments;
      } catch (error: any) {
        console.error('[useListAppointments] Error fetching appointments:', {
          error,
          errorMessage: error?.message,
          errorStack: error?.stack,
          errorType: typeof error,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    retryDelay: 1000,
  });

  // Log query state changes
  useEffect(() => {
    console.log('[useListAppointments] Query state changed:', {
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error,
      dataCount: query.data?.length,
      enabled: !!actor && !actorFetching,
      actorAvailable: !!actor,
      actorFetching,
      timestamp: new Date().toISOString(),
    });
  }, [query.isLoading, query.isFetching, query.isError, query.error, query.data, actor, actorFetching]);

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      console.log('[useGetCallerUserProfile] Query function called');
      if (!actor) throw new Error('Actor not available');
      try {
        const profile = await actor.getCallerUserProfile();
        console.log('[useGetCallerUserProfile] Profile fetched:', profile);
        return profile;
      } catch (error: any) {
        console.error('[useGetCallerUserProfile] Error:', error?.message);
        throw error;
      }
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
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      console.log('[useGetCallerUserRole] Query function called');
      if (!actor) throw new Error('Actor not available');
      try {
        const role = await actor.getCallerUserRole();
        console.log('[useGetCallerUserRole] Role fetched:', role);
        return role;
      } catch (error: any) {
        console.error('[useGetCallerUserRole] Error:', error?.message);
        throw error;
      }
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

export function useUpdateAppointmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ index, status }: { index: bigint; status: AppointmentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAppointmentStatus(index, status);
    },
    onMutate: async ({ index, status }) => {
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      const previousAppointments = queryClient.getQueryData<AppointmentRequest[]>(['appointments']);

      if (previousAppointments) {
        const optimisticAppointments = [...previousAppointments];
        const appointmentIndex = Number(index);
        if (appointmentIndex < optimisticAppointments.length) {
          optimisticAppointments[appointmentIndex] = {
            ...optimisticAppointments[appointmentIndex],
            status,
          };
          queryClient.setQueryData(['appointments'], optimisticAppointments);
        }
      }

      return { previousAppointments };
    },
    onError: (err, variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
      toast.error('Failed to update appointment status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment status updated successfully');
    },
  });
}
