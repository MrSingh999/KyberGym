import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { WorkoutListItem, WorkoutWithDays, WorkoutFilters } from "../types";
import { CreateWorkoutData, UpdateWorkoutData, WorkoutDayFormData } from "../schemas/workout.schema";
import { SortingState } from "@tanstack/react-table";

export const workoutKeys = {
  all: (gymId: string) => ["workouts", gymId] as const,
  list: (gymId: string, params: object) => ["workouts", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["workouts", gymId, "detail", id] as const,
};

interface UseWorkoutsParams {
  search?: string;
  filters?: WorkoutFilters;
  sorting?: SortingState;
}

export function useWorkouts(params: UseWorkoutsParams = {}) {
  const { selectedGymId } = useGymStore();
  const { search = "", filters = {}, sorting } = params;

  return useQuery({
    queryKey: workoutKeys.list(selectedGymId ?? "", { search, filters, sorting }),
    queryFn: async (): Promise<WorkoutListItem[]> => {
      const response = await apiClient.get("/workouts");
      const raw = response.data.data || response.data;

      let list: WorkoutListItem[] = raw.map((w: any) => ({
        id: w._id,
        title: w.title,
        description: w.description,
        assignmentType: w.assignmentType,
        assignedMemberCount: w.assignedMembers?.length ?? 0,
        daysCount: w.daysCount ?? 0,
        isActive: w.isActive ?? true,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));

      if (search) {
        const q = search.toLowerCase();
        list = list.filter((w) => w.title.toLowerCase().includes(q));
      }

      if (filters.isActive !== undefined) {
        list = list.filter((w) => w.isActive === filters.isActive);
      }

      if (filters.assignmentType) {
        list = list.filter((w) => w.assignmentType === filters.assignmentType);
      }

      if (sorting?.length) {
        const { id, desc } = sorting[0];
        list.sort((a, b) => {
          let aVal: string | number = "";
          let bVal: string | number = "";
          if (id === "title") { aVal = a.title; bVal = b.title; }
          if (id === "createdAt") { aVal = a.createdAt; bVal = b.createdAt; }
          if (id === "updatedAt") { aVal = a.updatedAt; bVal = b.updatedAt; }
          if (id === "assignmentType") { aVal = a.assignmentType; bVal = b.assignmentType; }
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return desc ? -cmp : cmp;
        });
      }

      return list;
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useWorkout(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery<WorkoutWithDays>({
    queryKey: workoutKeys.detail(selectedGymId ?? "", id),
    queryFn: async () => {
      const response = await apiClient.get(`/workouts/${id}`);
      const w = response.data.data || response.data;
      return {
        id: w._id,
        gymId: w.gymId,
        title: w.title,
        description: w.description,
        assignmentType: w.assignmentType,
        assignedMembers: w.assignedMembers || [],
        isActive: w.isActive ?? true,
        createdBy: w.createdBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        days: (w.days || []).map((d: any) => ({
          id: d._id,
          workoutId: d.workoutId || id,
          dayNumber: d.dayNumber,
          dayName: d.dayName,
          title: d.title,
          exercises: (d.exercises || []).map((e: any) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            notes: e.notes,
            image: e.image,
            videoUrl: e.videoUrl,
          })),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      };
    },
    enabled: !!selectedGymId && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkout() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkoutData) => {
      const response = await apiClient.post("/workouts", data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateWorkout(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkoutData) => {
      const response = await apiClient.patch(`/workouts/${id}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useDeleteWorkout() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useCreateWorkoutDay(workoutId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkoutDayFormData) => {
      const response = await apiClient.post(`/workouts/${workoutId}/days`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(selectedGymId ?? "", workoutId) });
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateWorkoutDay(workoutId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dayId, data }: { dayId: string; data: Partial<WorkoutDayFormData> }) => {
      const response = await apiClient.patch(`/workouts/${workoutId}/days/${dayId}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(selectedGymId ?? "", workoutId) });
    },
  });
}

export function useDeleteWorkoutDay(workoutId: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dayId: string) => {
      await apiClient.delete(`/workouts/${workoutId}/days/${dayId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(selectedGymId ?? "", workoutId) });
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}
