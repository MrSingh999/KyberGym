import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { AvatarUpload } from "./AvatarUpload";
import {
  createMemberStep1Schema, CreateMemberStep1Data,
  createMemberStep2Schema, CreateMemberStep2Data,
  createMemberStep3Schema, CreateMemberStep3Data,
} from "../schemas/member.schema";

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Membership" },
  { id: 3, label: "Emergency" },
  { id: 4, label: "Review" },
];

interface CreateMemberWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function CreateMemberWizard({ onSuccess, onCancel }: CreateMemberWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  // Each step's data is accumulated and merged on submit
  const [step1Data, setStep1Data] = useState<Partial<CreateMemberStep1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<CreateMemberStep2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<CreateMemberStep3Data>>({});

  const { data: plansData } = usePlans({ pageSize: 100 });
  const activePlans = useMemo(() => plansData?.data?.filter(p => p.status === 'active') || [], [plansData]);

  const step1Form = useForm<CreateMemberStep1Data>({ resolver: zodResolver(createMemberStep1Schema), defaultValues: { name: "", email: "", phone: "", gender: "male" } });
  const step2Form = useForm<CreateMemberStep2Data>({ resolver: zodResolver(createMemberStep2Schema), defaultValues: { planId: "", membershipStartDate: new Date().toISOString().split("T")[0], membershipEndDate: "" } });
  const step3Form = useForm<CreateMemberStep3Data>({ resolver: zodResolver(createMemberStep3Schema) });

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("kybergym_member_draft");
    if (saved) {
      try {
        const { step1, step2, step3, step } = JSON.parse(saved);
        if (step1) { setStep1Data(step1); step1Form.reset(step1); }
        if (step2) { setStep2Data(step2); step2Form.reset(step2); }
        if (step3) { setStep3Data(step3); step3Form.reset(step3); }
        if (step) setCurrentStep(step);
      } catch {}
    }
  }, [step1Form, step2Form, step3Form]);

  // Auto-save draft on data changes
  useEffect(() => {
    if (currentStep > 1) {
      localStorage.setItem(
        "kybergym_member_draft",
        JSON.stringify({ step1: step1Data, step2: step2Data, step3: step3Data, step: currentStep })
      );
    }
  }, [step1Data, step2Data, step3Data, currentStep]);

  // Auto calculate membership end date
  const selectedPlanId = step2Form.watch("planId");
  const startDateVal = step2Form.watch("membershipStartDate");

  useEffect(() => {
    if (selectedPlanId && startDateVal) {
      const plan = activePlans.find((p) => p.id === selectedPlanId);
      if (plan) {
        let durationInDays = plan.duration;
        if (plan.durationType === 'weeks') durationInDays = plan.duration * 7;
        if (plan.durationType === 'months') durationInDays = plan.duration * 30;
        if (plan.durationType === 'years') durationInDays = plan.duration * 365;

        const start = new Date(startDateVal);
        if (!isNaN(start.getTime())) {
          const end = addDays(start, durationInDays);
          step2Form.setValue("membershipEndDate", format(end, "yyyy-MM-dd"));
        }
      }
    }
  }, [selectedPlanId, startDateVal, activePlans, step2Form]);

  const handleStep1Submit = (data: CreateMemberStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };
  const handleStep2Submit = (data: CreateMemberStep2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };
  const handleStep3Submit = (data: CreateMemberStep3Data) => {
    setStep3Data(data);
    setCurrentStep(4);
  };
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let profilePhotoBase64 = "";
      if (profilePhotoFile) {
        profilePhotoBase64 = await convertToBase64(profilePhotoFile);
      }

      // 1. Create the Member
      const memberRes = await apiClient.post('/members', {
        fullName: step1Data.name,
        email: step1Data.email || undefined,
        phone: step1Data.phone || undefined,
        gender: step1Data.gender || 'male',
        dateOfBirth: step1Data.dateOfBirth || undefined,
        address: step1Data.address || undefined,
        profilePhoto: profilePhotoBase64 || undefined,
        emergencyContact: {
          name: step3Data.emergencyContactName || undefined,
          phone: step3Data.emergencyContactPhone || undefined,
        }
      });
      const createdMember = memberRes.data.data;
      const memberId = createdMember._id;

      // 2. Create subscription if a plan was selected
      if (step2Data.planId) {
        const now = new Date();
        const start = step2Data.membershipStartDate ? new Date(step2Data.membershipStartDate) : now;
        let startDateStr = start.toISOString();
        if (start.toDateString() === now.toDateString()) {
          startDateStr = now.toISOString();
        }

        await apiClient.post('/member-subscriptions', {
          memberId,
          membershipPlanId: step2Data.planId,
          startDate: startDateStr,
        });
      }

      // Clear draft on success
      localStorage.removeItem("kybergym_member_draft");
      toast.success("Member registered successfully!");
      onSuccess();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to register member. Please check details and try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-1">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-all",
                currentStep > step.id ? "bg-primary border-primary text-primary-foreground" :
                currentStep === step.id ? "bg-primary/10 border-primary text-primary" :
                "bg-surface-hover border-default text-muted"
              )}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className={cn("text-[10px] font-medium hidden sm:block", currentStep === step.id ? "text-primary" : "text-muted")}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-2", currentStep > step.id ? "bg-primary" : "bg-subtle")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {currentStep === 1 && (
          <Form {...step1Form}>
            <form id="step1" onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5 animate-fade-slide-up">
              <div className="pb-4 flex justify-center">
                <AvatarUpload 
                  name={step1Form.watch("name") || "Member"} 
                  onChange={(file) => setProfilePhotoFile(file)} 
                />
              </div>
              <FormField control={step1Form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Alex Johnson" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step1Form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone *</FormLabel><FormControl><Input placeholder="+1 555 000 0000" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step1Form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="alex@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={step1Form.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender *</FormLabel><FormControl>
                    <select {...field} className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={step1Form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </form>
          </Form>
        )}

        {currentStep === 2 && (
          <Form {...step2Form}>
            <form id="step2" onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-5 animate-fade-slide-up">
              <FormField control={step2Form.control} name="planId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Plan *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus-visible:outline-none"
                    >
                      <option value="">Select a plan...</option>
                      {activePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} (${plan.price})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipStartDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipEndDate" render={({ field }) => (
                <FormItem><FormLabel>End Date *</FormLabel><FormControl><Input type="date" readOnly {...field} className="bg-surface-hover cursor-not-allowed text-muted" /></FormControl><FormMessage /></FormItem>
              )} />
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <Form {...step3Form}>
            <form id="step3" onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-5 animate-fade-slide-up">
              <p className="text-sm text-secondary -mt-2">Emergency contact details (optional but recommended).</p>
              <FormField control={step3Form.control} name="emergencyContactName" render={({ field }) => (
                <FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="Jane Johnson" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step3Form.control} name="emergencyContactPhone" render={({ field }) => (
                <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+1 555 000 0000" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step3Form.control} name="emergencyContactRelation" render={({ field }) => (
                <FormItem><FormLabel>Relation</FormLabel><FormControl><Input placeholder="Spouse, Parent..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </form>
          </Form>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-slide-up">
            <p className="text-sm text-secondary">Review member details before creating the profile.</p>
            <div className="rounded-xl border border-default bg-surface-hover p-4 space-y-3">
              {[
                { label: "Name", value: step1Data.name },
                { label: "Phone", value: step1Data.phone },
                { label: "Email", value: step1Data.email || "—" },
                { label: "Plan", value: activePlans.find(p => p.id === step2Data.planId)?.name || "—" },
                { label: "Start", value: step2Data.membershipStartDate },
                { label: "End", value: step2Data.membershipEndDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer - sticky on mobile */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-subtle sticky bottom-0 bg-surface">
        <Button
          variant="outline"
          className="min-h-[44px]"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep((prev) => (prev - 1) as WizardStep)}
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 4 ? (
          <Button type="submit" className="min-h-[44px]" form={`step${currentStep}`}>
            Continue
          </Button>
        ) : (
          <LoadingButton className="min-h-[44px]" onClick={handleFinalSubmit} isLoading={isSubmitting} loadingText="Creating...">
            Create Member
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
