import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminScheduleCategory,
  createAdminScheduleEvent,
  deleteAdminScheduleCategory,
  deleteAdminScheduleEvent,
  fetchAdminScheduleCategories,
  fetchAdminScheduleEvents,
  updateAdminScheduleCategory,
  updateAdminScheduleEvent,
  type ScheduleCategoryInput,
  type ScheduleEventInput,
} from "../api";
import { SCHEDULE_CATEGORIES_QUERY_KEY, SCHEDULE_EVENTS_QUERY_KEY } from "@/features/schedule/hooks/useSchedule";

const ADMIN_SCHEDULE_EVENTS_QUERY_KEY = ["admin-schedule-events"];
const ADMIN_SCHEDULE_CATEGORIES_QUERY_KEY = ["admin-schedule-categories"];

function useInvalidateAfterEventMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_SCHEDULE_EVENTS_QUERY_KEY });
    // The public /schedule calendar reads from the same underlying data.
    queryClient.invalidateQueries({ queryKey: SCHEDULE_EVENTS_QUERY_KEY });
  };
}

function useInvalidateAfterCategoryMutation() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_SCHEDULE_CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SCHEDULE_CATEGORIES_QUERY_KEY });
    // Events embed their categoryId — nothing to remap client-side, but the
    // calendar re-renders category colors/names once categories refresh too.
    queryClient.invalidateQueries({ queryKey: ADMIN_SCHEDULE_EVENTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SCHEDULE_EVENTS_QUERY_KEY });
  };
}

export function useAdminScheduleEvents() {
  return useQuery({ queryKey: ADMIN_SCHEDULE_EVENTS_QUERY_KEY, queryFn: fetchAdminScheduleEvents });
}

export function useCreateAdminScheduleEvent() {
  const invalidate = useInvalidateAfterEventMutation();
  return useMutation({
    mutationFn: (input: ScheduleEventInput) => createAdminScheduleEvent(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminScheduleEvent() {
  const invalidate = useInvalidateAfterEventMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ScheduleEventInput }) => updateAdminScheduleEvent(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminScheduleEvent() {
  const invalidate = useInvalidateAfterEventMutation();
  return useMutation({
    mutationFn: (id: number) => deleteAdminScheduleEvent(id),
    onSuccess: invalidate,
  });
}

export function useAdminScheduleCategories() {
  return useQuery({ queryKey: ADMIN_SCHEDULE_CATEGORIES_QUERY_KEY, queryFn: fetchAdminScheduleCategories });
}

export function useCreateAdminScheduleCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: (input: ScheduleCategoryInput) => createAdminScheduleCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminScheduleCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ScheduleCategoryInput }) =>
      updateAdminScheduleCategory(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminScheduleCategory() {
  const invalidate = useInvalidateAfterCategoryMutation();
  return useMutation({
    mutationFn: (id: number) => deleteAdminScheduleCategory(id),
    onSuccess: invalidate,
  });
}
