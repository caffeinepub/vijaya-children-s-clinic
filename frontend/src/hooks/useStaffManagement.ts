import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { StaffUser } from '../backend';
import { toast } from 'sonner';

export function useGetAllStaff() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StaffUser[]>({
    queryKey: ['staffUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllActiveStaffUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStaff: StaffUser) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStaffUser(newStaff);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      toast.success('Staff account created successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to create staff account', {
        description: errorMessage,
      });
    },
  });
}

export function useUpdateStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updatedStaff }: { userId: string; updatedStaff: StaffUser }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStaffUser(userId, updatedStaff);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      toast.success('Staff account updated successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to update staff account', {
        description: errorMessage,
      });
    },
  });
}

export function useDeleteStaff() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStaffUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      toast.success('Staff account deleted successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('Failed to delete staff account', {
        description: errorMessage,
      });
    },
  });
}
