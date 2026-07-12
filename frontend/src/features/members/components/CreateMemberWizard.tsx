import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../components/forms/Form";
import { Input } from "../../../../components/ui/Input";
import { Button, LoadingButton } from "../../../../components/ui/Button";
import { cn } from "../../../../lib/utils";
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

export function CreateMemberWizard({ onSuccess, onCancel }: CreateMemberWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Each step's data is accumulated and merged on submit
  const [step1Data, setStep1Data] = useState<Partial<CreateMemberStep1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<CreateMemberStep2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<CreateMemberStep3Data>>({});

  const step1Form = useForm<CreateMemberStep1Data>({ resolver: zodResolver(createMemberStep1Schema), defaultValues: { name: "", email: "", phone: "", gender: "male" } });
  const step2Form = useForm<CreateMemberStep2Data>({ resolver: zodResolver(createMemberStep2Schema), defaultValues: { planId: "", membershipStartDate: "", membershipEndDate: "" } });
  const step3Form = useForm<CreateMemberStep3Data>({ resolver: zodResolver(createMemberStep3Schema) });

  // Draft Recovery: Load saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("kybergym_member_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.step1) {
          setStep1Data(parsed.step1);
          step1Form.reset(parsed.step1);
        }
        if (parsed.step2) {
          setStep2Data(parsed.step2);
          step2Form.reset(parsed.step2);
        }
        if (parsed.step3) {
          setStep3Data(parsed.step3);
          step3Form.reset(parsed.step3);
        }
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {
        // invalid draft
      }
    }
  }, []);

  // Autosave: Save to localStorage whenever data changes
  useEffect(() => {
    const draft = { step1: step1Data, step2: step2Data, step3: step3Data, currentStep };
    localStorage.setItem("kybergym_member_draft", JSON.stringify(draft));
  }, [step1Data, step2Data, step3Data, currentStep]);

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
      // Merge all step data and submit
      // const fullData = { ...step1Data, ...step2Data, ...step3Data };
      // await apiClient.post('/members', { ...fullData, gymId: selectedGymId });
      await new Promise((r) => setTimeout(r, 1200));
      // Clear draft on success
      localStorage.removeItem("kybergym_member_draft");
      onSuccess();
    } catch {
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
            <form id="step1" onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5">
              <FormField control={step1Form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="Alex Johnson" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step1Form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone *</FormLabel><FormControl><Input placeholder="+1 555 000 0000" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step1Form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="alex@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
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
            <form id="step2" onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-5">
              <FormField control={step2Form.control} name="planId" render={({ field }) => (
                <FormItem><FormLabel>Membership Plan *</FormLabel><FormControl><Input placeholder="Select a plan..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipStartDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={step2Form.control} name="membershipEndDate" render={({ field }) => (
                <FormItem><FormLabel>End Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <Form {...step3Form}>
            <form id="step3" onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-5">
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
          <div className="space-y-4">
            <p className="text-sm text-secondary">Review member details before creating the profile.</p>
            <div className="rounded-xl border border-default bg-surface-hover p-4 space-y-3">
              {[
                { label: "Name", value: step1Data.name },
                { label: "Phone", value: step1Data.phone },
                { label: "Email", value: step1Data.email || "—" },
                { label: "Plan", value: step2Data.planId },
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

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-subtle">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep((prev) => (prev - 1) as WizardStep)}
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 4 ? (
          <Button type="submit" form={`step${currentStep}`}>
            Continue
          </Button>
        ) : (
          <LoadingButton onClick={handleFinalSubmit} isLoading={isSubmitting} loadingText="Creating...">
            Create Member
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
