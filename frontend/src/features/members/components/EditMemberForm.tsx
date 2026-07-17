import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBlocker } from "react-router";
import { X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { MemberProfile } from "../types/profile";
import { editMemberSchema, EditMemberData } from "../schemas/member.schema";
import { AvatarUpload } from "./AvatarUpload";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface EditMemberFormProps {
  member: MemberProfile;
  onSubmit: (data: EditMemberData, file: File | null, removed: boolean) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const inputClass = "flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-colors";
const selectClass = "flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

export function EditMemberForm({ member, onSubmit, onCancel, isSubmitting }: EditMemberFormProps) {
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoRemoved, setProfilePhotoRemoved] = useState(false);

  const form = useForm<EditMemberData>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: member.name,
      email: member.email || "",
      phone: member.phone,
      gender: member.gender || "male",
      dateOfBirth: member.dateOfBirth || "",
      address: member.address || "",
      emergencyContactName: member.emergencyContactName || "",
      emergencyContactPhone: member.emergencyContactPhone || "",
      notes: member.rawNotes || "",
      membershipStartDate: member.membershipStartDate || "",
      membershipEndDate: member.membershipEndDate || "",
    },
  });

  const { isDirty } = form.formState;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (isDirty || profilePhotoFile !== null || profilePhotoRemoved) && 
      currentLocation.pathname !== nextLocation.pathname
  );

  const [blockerDialogOpen, setBlockerDialogOpen] = useState(false);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setBlockerDialogOpen(true);
    }
  }, [blocker.state]);

  const handlePhotoChange = (file: File | null) => {
    setProfilePhotoFile(file);
    if (file === null) {
      setProfilePhotoRemoved(true);
    } else {
      setProfilePhotoRemoved(false);
    }
    form.setValue("name", form.getValues("name"), { shouldDirty: true });
  };

  const handleFormSubmit = async (data: EditMemberData) => {
    await onSubmit(data, profilePhotoFile, profilePhotoRemoved);
  };

  const hasChanges = isDirty || profilePhotoFile !== null || profilePhotoRemoved;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Photo */}
        <div className="flex justify-center">
          <AvatarUpload 
            currentPhotoUrl={member.profilePhoto}
            name={member.name} 
            onChange={handlePhotoChange} 
          />
        </div>

        {/* Section: Personal Details */}
        <section>
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono mb-5">Personal Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Alex Johnson" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="+1 555 000 0000" type="tel" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="alex@example.com" type="email" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <FormControl>
                  <select {...field} className={selectClass}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </section>

        {/* Section: Membership Timeline */}
        {member.activeSubId && (
          <section>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono mb-5">Membership Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormField control={form.control} name="membershipStartDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="membershipEndDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>
        )}

        {/* Section: Emergency Contact */}
        <section>
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono mb-5">Emergency Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 555 000 0000" type="tel" {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </section>

        {/* Section: Staff Notes */}
        <section>
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono mb-5">Staff Notes</h4>
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="Internal notes about this member..."
                  rows={4}
                  className="flex w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="min-h-[44px] px-6">
              Cancel
            </Button>
          )}
          <LoadingButton
            type="submit"
            className="min-h-[44px] px-6"
            disabled={!hasChanges}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save Changes
          </LoadingButton>
        </div>
      </form>

      {/* Unsaved Changes Blocker Dialog */}
      <AlertDialog open={blockerDialogOpen} onOpenChange={setBlockerDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { blocker.reset?.(); setBlockerDialogOpen(false); }}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => { blocker.proceed?.(); setBlockerDialogOpen(false); }}>
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
