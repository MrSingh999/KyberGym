import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  markAttendanceSchema,
  MarkAttendanceData,
} from "../schemas/attendance.schema";
import { useMarkAttendance } from "../hooks/useAttendance";

interface MarkAttendanceFormProps {
  onSuccess: () => void;
}

export function MarkAttendanceForm({ onSuccess }: MarkAttendanceFormProps) {
  const { mutateAsync, isPending } = useMarkAttendance();

  const form = useForm<MarkAttendanceData>({
    resolver: zodResolver(markAttendanceSchema),
    defaultValues: {
      memberId: "",
      status: "present",
      notes: "",
    },
  });

  const onSubmit = async (data: MarkAttendanceData) => {
    try {
      await mutateAsync(data);
      toast.success("Attendance marked successfully.");
      form.reset();
      onSuccess();
    } catch (e: any) {
      const errMsg =
        e.response?.data?.message || "Failed to mark attendance.";
      toast.error(errMsg);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 pt-2 animate-fade-slide-up"
      >
        <FormField
          control={form.control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Member ID *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                  <Input
                    placeholder="Search or enter member ID..."
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full bg-surface border border-border-default rounded-[6px] px-3 py-3 h-auto min-h-[44px] text-sm text-text-primary cursor-pointer">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border border-border-hover rounded-[6px] shadow-2xl">
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Optional notes..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full min-h-[44px]"
          isLoading={isPending}
          loadingText="Saving..."
        >
          Mark Attendance
        </LoadingButton>
      </form>
    </Form>
  );
}
