import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBlocker } from "react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import { MemberProfile } from "../types/profile";
import { createMemberStep1Schema, CreateMemberStep1Data } from "../schemas/member.schema";
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

interface EditMemberFormProps {
  member: MemberProfile;
  onSubmit: (data: CreateMemberStep1Data, file: File | null, removed: boolean) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditMemberForm({ member, onSubmit, isSubmitting }: EditMemberFormProps) {
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoRemoved, setProfilePhotoRemoved] = useState(false);

  const form = useForm<CreateMemberStep1Data>({
    resolver: zodResolver(createMemberStep1Schema),
    defaultValues: {
      name: member.name,
      email: member.email || "",
      phone: member.phone,
      gender: member.gender || "male",
      dateOfBirth: member.dateOfBirth || "",
      address: member.address || "",
    },
  });

  const { isDirty } = form.formState;

  // Unsaved changes protection via React Router v7
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
    // Set dirty state manually
    form.setValue("name", form.getValues("name"), { shouldDirty: true });
  };

  const handleFormSubmit = async (data: CreateMemberStep1Data) => {
    await onSubmit(data, profilePhotoFile, profilePhotoRemoved);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 animate-fade-slide-up">
        <div className="pb-4">
          <AvatarUpload 
            currentPhotoUrl={member.profilePhoto}
            name={member.name} 
            onChange={handlePhotoChange} 
          />
        </div>

        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name *</FormLabel>
            <FormControl>
              <Input placeholder="Alex Johnson" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone *</FormLabel>
            <FormControl>
              <Input placeholder="+1 555 000 0000" type="tel" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="alex@example.com" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <FormControl>
                <select {...field} className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
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
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="pt-4 flex justify-end">
          <LoadingButton type="submit" className="min-h-[44px] w-full sm:w-auto" disabled={!isDirty && profilePhotoFile === null && !profilePhotoRemoved} isLoading={isSubmitting} loadingText="Saving...">
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
