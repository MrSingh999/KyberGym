import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, UserPlus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/forms/Form";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import { usePlans } from "@/features/plans/hooks/usePlans";
import { AvatarUpload } from "./AvatarUpload";
import { Card, CardContent } from "@/components/ui/Card";
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

      const body: Record<string, any> = {
        fullName: step1Data.name,
        password: step1Data.password || undefined,
        email: step1Data.email || undefined,
        phone: step1Data.phone || undefined,
        gender: step1Data.gender || 'male',
        address: step1Data.address || undefined,
      };

      if (step1Data.dateOfBirth) {
        body.dateOfBirth = new Date(step1Data.dateOfBirth).toISOString();
      }

      if (step1Data.email) {
        body.email = step1Data.email;
      }

      if (step3Data.emergencyContactName || step3Data.emergencyContactPhone) {
        body.emergencyContact = {
          name: step3Data.emergencyContactName || undefined,
          phone: step3Data.emergencyContactPhone || undefined,
        };
      }

      // 1. Create the Member
      const memberRes = await apiClient.post('/members', body);
      const createdMember = memberRes.data.data;
      const memberId = createdMember.id || createdMember._id;

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
      const loginPassword = createdMember.defaultPassword || step1Data.password || 'Member@123';
      const loginEmail = createdMember.email || step1Data.email;
      if (loginEmail) {
        toast.success("Member registered successfully!", {
          description: `Login: ${loginEmail} / Password: ${loginPassword}`,
          duration: 10000,
        });
      } else {
        toast.success("Member registered successfully!");
      }
      onSuccess();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to register member. Please check details and try again.";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 px-1 shrink-0">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold border-2 transition-all duration-200",
                currentStep > step.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : currentStep === step.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-surface text-text-secondary border-border-default"
              )}>
                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wide hidden sm:block transition-colors duration-200",
                currentStep === step.id ? "text-primary" : "text-text-muted"
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 transition-all duration-200", currentStep > step.id ? "bg-primary" : "bg-border-default")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
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
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Full Name <span className="text-error">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step1Form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Phone <span className="text-error">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 555 000 0000" 
                      type="tel" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step1Form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="alex@example.com" 
                      type="email" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step1Form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Password</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Leave blank for default (Member@123)" 
                      type="text" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-text-muted mt-1">Default: Member@123 if left empty</p>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={step1Form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-text-primary">Gender <span className="text-error">*</span></FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={step1Form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-text-primary">Date of Birth</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                  <FormLabel className="text-sm font-semibold text-text-primary">Membership Plan <span className="text-error">*</span></FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer"
                    >
                      <option value="">Select a plan...</option>
                      {activePlans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} (₹{plan.price})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipStartDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Start Date <span className="text-error">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipEndDate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">End Date <span className="text-error">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      readOnly 
                      {...field} 
                      className="h-11 border-border-default cursor-not-allowed text-text-muted opacity-60" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <Form {...step3Form}>
            <form id="step3" onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-5 animate-fade-slide-up">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface border border-border-default mb-2">
                <span className="text-xs text-text-muted leading-relaxed">
                  Emergency contact details <span className="font-semibold text-text-secondary">(optional but recommended)</span>
                </span>
              </div>
              <FormField control={step3Form.control} name="emergencyContactName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Contact Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Jane Johnson" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step3Form.control} name="emergencyContactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Contact Phone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 555 000 0000" 
                      type="tel" 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={step3Form.control} name="emergencyContactRelation" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-text-primary">Relation</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Spouse, Parent..." 
                      className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </form>
          </Form>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-slide-up">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface border border-border-default">
              <span className="text-xs text-text-muted leading-relaxed">
                Review member details before creating the profile.
              </span>
            </div>
            <Card className="border-border-default bg-surface/50 shadow-sm">
              <CardContent className="p-0 divide-y divide-border-default">
                {[
                  { label: "Full Name", value: step1Data.name },
                  { label: "Phone", value: step1Data.phone },
                  { label: "Email", value: step1Data.email || "—" },
                  { label: "Gender", value: step1Data.gender ? step1Data.gender.charAt(0).toUpperCase() + step1Data.gender.slice(1) : "—" },
                  { label: "Date of Birth", value: step1Data.dateOfBirth || "—" },
                  { label: "Membership Plan", value: activePlans.find(p => p.id === step2Data.planId)?.name || "—" },
                  { label: "Start Date", value: step2Data.membershipStartDate || "—" },
                  { label: "End Date", value: step2Data.membershipEndDate || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-semibold text-text-primary text-right">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border-default shrink-0">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 min-h-[44px] border-border-default text-text-secondary hover:text-text-primary"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep((prev) => (prev - 1) as WizardStep)}
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 4 ? (
          <Button 
            type="submit" 
            size="lg" 
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            form={`step${currentStep}`}
          >
            Continue
          </Button>
        ) : (
          <LoadingButton 
            size="lg" 
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            onClick={handleFinalSubmit} 
            isLoading={isSubmitting} 
            loadingText="Creating..."
          >
            Create Member
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
