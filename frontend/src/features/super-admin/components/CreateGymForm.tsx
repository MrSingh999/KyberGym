import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { LoadingButton } from "@/components/ui/button";
import { useSACreateGym } from "../hooks/useSuperAdmin";

const createGymSchema = z.object({
  gymName: z.string().min(2, "Gym name must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(30)
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain can only contain lowercase letters, numbers, and hyphens"
    ),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  phone: z.string().optional(),
});

type CreateGymFormData = z.infer<typeof createGymSchema>;

interface CreateGymFormProps {
  onSuccess?: (result: { temporaryPassword: string }) => void;
  onCancel?: () => void;
}

export function CreateGymForm({ onSuccess, onCancel }: CreateGymFormProps) {
  const { mutate: createGym, isPending: isCreating } = useSACreateGym();

  const form = useForm<CreateGymFormData>({
    resolver: zodResolver(createGymSchema),
    defaultValues: {
      gymName: "",
      subdomain: "",
      ownerName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = (data: CreateGymFormData) => {
    createGym(data, {
      onSuccess: (result) => {
        toast.success("Gym created successfully");
        onSuccess?.(result);
      },
      onError: (err: Error) => {
        toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create gym");
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="gymName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Iron Paradise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain</FormLabel>
              <FormControl>
                <Input placeholder="iron-paradise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ownerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Password (optional)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Defaults to Admin@123"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border-default w-full">
          {onCancel && (
            <LoadingButton
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </LoadingButton>
          )}
          <LoadingButton type="submit" isLoading={isCreating} className="w-full sm:w-auto min-w-[120px]">
            Create Gym
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
