import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createTrainerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
});

interface CreateTrainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

export function CreateTrainerModal({ open, onOpenChange, onSubmit, isPending }: CreateTrainerModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createTrainerSchema),
    defaultValues: { fullName: "", email: "", password: "", phone: "", specialization: "" },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Add Trainer" description="Create a new trainer account.">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} className="mt-1.5" />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} className="mt-1.5" />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register("password")} className="mt-1.5" />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...register("phone")} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="specialization">Specialization (optional)</Label>
          <Input id="specialization" {...register("specialization")} className="mt-1.5" placeholder="e.g. Strength Training, Yoga" />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Create Trainer
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
