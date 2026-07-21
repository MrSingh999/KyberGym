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

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.category) queryParams.set("category", filters.category);
  if (sorting?.length) {
    const { id, desc } = sorting[0];
    queryParams.set("sort", id);
    queryParams.set("order", desc ? "desc" : "asc");
  }
  const qs = queryParams.toString();

  return useQuery({
    queryKey: workoutKeys.list(selectedGymId ?? "", { search, filters, sorting }),
    queryFn: async (): Promise<WorkoutListItem[]> => {
      const response = await apiClient.get(`/workouts${qs ? `?${qs}` : ""}`);
      const raw = response.data.data || response.data;

      return raw.map((w: any): WorkoutListItem => ({
        id: w._id || w.id,
        title: w.title,
        description: w.description,
        goal: w.goal,
        category: w.category,
        estimatedDuration: w.estimatedDuration,
        status: w.status ?? "ACTIVE",
        daysCount: w.daysCount ?? 0,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    },
    enabled: !!selectedGymId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useWorkout(id: string, options: { enabled?: boolean } = {}) {
  const { selectedGymId } = useGymStore();

  return useQuery<WorkoutWithDays>({
    queryKey: workoutKeys.detail(selectedGymId ?? "", id),
    queryFn: async () => {
      const response = await apiClient.get(`/workouts/${id}`);
      const w = response.data.data || response.data;
      return {
        _id: w._id || w.id,
        gymId: w.gymId,
        title: w.title,
        description: w.description,
        goal: w.goal,
        estimatedDuration: w.estimatedDuration,
        category: w.category,
        status: w.status ?? "ACTIVE",
        isDeleted: w.isDeleted ?? false,
        createdBy: w.createdBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        days: (w.days || []).map((d: any): WorkoutDay => ({
          _id: d._id || d.id,
          workoutId: d.workoutId || id,
          orderIndex: d.orderIndex ?? 0,
          dayName: d.dayName,
          title: d.title,
          exercises: (d.exercises || []).map((e: any): Exercise => ({
            _id: e._id,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            restTime: e.restTime,
            notes: e.notes,
            order: e.order ?? 0,
            exerciseId: e.exerciseId ?? null,
            image: e.image,
            videoUrl: e.videoUrl,
          })),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      };
    },
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

export function useDuplicateWorkout() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/workouts/${id}/duplicate`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useArchiveWorkout() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/workouts/${id}/archive`);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useSaveNestedWorkout(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put(`/workouts/${id}/nested`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: workoutKeys.detail(selectedGymId ?? "", id) });
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

export function useMemberWorkouts() {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: workoutKeys.list(selectedGymId ?? "", { type: "member" }),
    queryFn: async (): Promise<WorkoutWithDays[]> => {
      const response = await apiClient.get("/members/me/workouts");
      const raw = response.data.data || response.data;
      return (Array.isArray(raw) ? raw : []).map((w: any): WorkoutWithDays => ({
        _id: w._id || w.id,
        gymId: w.gymId,
        title: w.title,
        description: w.description,
        goal: w.goal,
        estimatedDuration: w.estimatedDuration,
        category: w.category,
        status: w.status ?? "ACTIVE",
        isDeleted: w.isDeleted ?? false,
        createdBy: w.createdBy,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        days: (w.days || []).map((d: any): WorkoutDay => ({
          _id: d._id || d.id,
          workoutId: d.workoutId || w._id || w.id,
          orderIndex: d.orderIndex ?? 0,
          dayName: d.dayName,
          title: d.title,
          exercises: (d.exercises || []).map((e: any): Exercise => ({
            _id: e._id,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            duration: e.duration,
            restTime: e.restTime,
            notes: e.notes,
            order: e.order ?? 0,
            exerciseId: e.exerciseId ?? null,
            image: e.image,
            videoUrl: e.videoUrl,
          })),
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
      }));
    },
    enabled: !!selectedGymId,
    staleTime: 5 * 60 * 1000,
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
