import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGymStore } from "@/store/gym.store";
import { apiClient } from "@/lib/apiClient";
import { MessageTemplate, MessageTemplateFilters } from "../types";
import { CreateMessageTemplateData, UpdateMessageTemplateData } from "../schemas/messageTemplate.schema";

export const messageTemplateKeys = {
  all: (gymId: string) => ["messageTemplates", gymId] as const,
  list: (gymId: string, params: object) => ["messageTemplates", gymId, "list", params] as const,
  detail: (gymId: string, id: string) => ["messageTemplates", gymId, "detail", id] as const,
};

interface UseMessageTemplatesParams {
  page?: number;
  limit?: number;
  filters?: MessageTemplateFilters;
}

export function useMessageTemplates(params: UseMessageTemplatesParams = {}) {
  const { selectedGymId } = useGymStore();
  const { page = 1, limit = 10, filters = {} } = params;

  return useQuery({
    queryKey: messageTemplateKeys.list(selectedGymId ?? "", { page, limit, ...filters }),
    queryFn: async () => {
      const response = await apiClient.get("/message-templates", {
        params: { page, limit, ...filters },
      });
      const data = response.data.data || [];
      const meta = response.data.meta;
      return {
        data: data.map((t: any): MessageTemplate => ({
          id: t.id || t._id,
          gymId: t.gymId,
          name: t.name,
          type: t.type,
          channel: t.channel,
          subject: t.subject,
          content: t.content,
          variables: t.variables || [],
          active: t.active ?? true,
          createdBy: t.createdBy,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        meta: meta ? { total: meta.total, page: meta.page, limit: meta.limit, totalPages: meta.totalPages } : undefined,
      };
    },
    enabled: !!selectedGymId,
  });
}

export function useMessageTemplate(id: string) {
  const { selectedGymId } = useGymStore();

  return useQuery({
    queryKey: messageTemplateKeys.detail(selectedGymId ?? "", id),
    queryFn: async (): Promise<MessageTemplate> => {
      const response = await apiClient.get(`/message-templates/${id}`);
      const t = response.data.data || response.data;
      return {
        id: t.id || t._id,
        gymId: t.gymId,
        name: t.name,
        type: t.type,
        channel: t.channel,
        subject: t.subject,
        content: t.content,
        variables: t.variables || [],
        active: t.active ?? true,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    },
    enabled: !!selectedGymId && !!id,
  });
}

export function useCreateMessageTemplate() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMessageTemplateData) => {
      const response = await apiClient.post("/message-templates", data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all(selectedGymId ?? "") });
    },
  });
}

export function useUpdateMessageTemplate(id: string) {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMessageTemplateData) => {
      const response = await apiClient.patch(`/message-templates/${id}`, data);
      return response.data.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all(selectedGymId ?? "") });
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.detail(selectedGymId ?? "", id) });
    },
  });
}

export function useDeleteMessageTemplate() {
  const { selectedGymId } = useGymStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/message-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageTemplateKeys.all(selectedGymId ?? "") });
    },
  });
}
