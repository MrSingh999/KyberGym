import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBlocker } from "react-router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/forms/Form";
import { Input } from "../../../../components/ui/Input";
import { LoadingButton } from "../../../../components/ui/Button";
import { MemberProfile } from "../types/profile";
import { createMemberStep1Schema, CreateMemberStep1Data } from "../schemas/member.schema";
import { AvatarUpload } from "./AvatarUpload";

interface EditMemberFormProps {
  member: MemberProfile;
  onSubmit: (data: CreateMemberStep1Data) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditMemberForm({ member, onSubmit, isSubmitting }: EditMemberFormProps) {
  const form = useForm<CreateMemberStep1Data>({
    resolver: zodResolver(createMemberStep1Schema),
    defaultValues: {
      name: member.name,
      email: member.email || "",
      phone: member.phone,
      gender: "male", // Would map from member if existed
    },
  });

  const { isDirty } = form.formState;

  // Unsaved changes protection via React Router v7
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="pb-4">
          <AvatarUpload 
            name={member.name} 
            onChange={() => form.setValue("name", form.getValues("name"), { shouldDirty: true })} 
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

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <FormControl>
                <select {...field} className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
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
          <LoadingButton type="submit" disabled={!isDirty} isLoading={isSubmitting} loadingText="Saving...">
            Save Changes
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
