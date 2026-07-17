import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createPlanStep1Schema, CreatePlanStep1, createPlanStep2Schema, CreatePlanStep2, createPlanStep3Schema, CreatePlanStep3, createPlanStep4Schema, CreatePlanStep4, CreatePlanData } from '../schemas/plan.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms/Form';
import { Input } from '@/components/ui/input';
import { Button, LoadingButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEFAULT_PLAN_FEATURES, DURATION_TYPE_LABELS } from '../types';
import { useCreatePlan } from '../hooks/usePlans';

type WizardStep = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: 'Basic' },
  { id: 2, label: 'Pricing' },
  { id: 3, label: 'Duration' },
  { id: 4, label: 'Features' },
];

const DRAFT_KEY = 'kybergym_plan_draft';

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#3b82f6', '#14b8a6',
];

interface CreatePlanWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreatePlanWizard({ onSuccess, onCancel }: CreatePlanWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [step1Data, setStep1Data] = useState<Partial<CreatePlanStep1>>({});
  const [step2Data, setStep2Data] = useState<Partial<CreatePlanStep2>>({});
  const [step3Data, setStep3Data] = useState<Partial<CreatePlanStep3>>({});
  const createPlan = useCreatePlan();

  const s1 = useForm<CreatePlanStep1>({ resolver: zodResolver(createPlanStep1Schema) });
  const s2 = useForm<CreatePlanStep2>({ resolver: zodResolver(createPlanStep2Schema), defaultValues: { price: 0, joiningFee: 0, isDefault: false, isPopular: false } });
  const s3 = useForm<CreatePlanStep3>({ resolver: zodResolver(createPlanStep3Schema), defaultValues: { duration: 1, durationType: 'months' } });
  const s4 = useForm<CreatePlanStep4>({
    resolver: zodResolver(createPlanStep4Schema),
    defaultValues: {
      features: DEFAULT_PLAN_FEATURES.map((f, i) => ({ ...f, id: `feat-${i}` })),
    },
  });
  const { fields, append, remove } = useFieldArray({ control: s4.control, name: 'features' });

  // Draft recovery
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.step1) { setStep1Data(d.step1); s1.reset(d.step1); }
      if (d.step2) { setStep2Data(d.step2); s2.reset(d.step2); }
      if (d.step3) { setStep3Data(d.step3); s3.reset(d.step3); }
      if (d.currentStep) setStep(d.currentStep);
    } catch { /* ignore */ }
  }, []);

  // Autosave
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step1: step1Data, step2: step2Data, step3: step3Data, currentStep: step }));
  }, [step1Data, step2Data, step3Data, step]);

  const handleFinalSubmit = async (s4d: CreatePlanStep4) => {
    const payload: CreatePlanData = { ...step1Data as CreatePlanStep1, ...step2Data as CreatePlanStep2, ...step3Data as CreatePlanStep3, ...s4d };
    localStorage.removeItem(DRAFT_KEY);
    await createPlan.mutateAsync(payload);
    onSuccess();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6 px-1 shrink-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold border-2 transition-all duration-200',
                step > s.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : step === s.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                  : 'bg-surface text-text-secondary border-border-default',
              )}>
                {step > s.id ? <Check className="h-5 w-5" /> : s.id}
              </div>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wide hidden sm:block transition-colors duration-200',
                step === s.id ? 'text-primary' : 'text-text-muted',
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 transition-all duration-200', step > s.id ? 'bg-primary' : 'bg-border-default')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>

            {/* Step 1 – Basic Info */}
            {step === 1 && (
              <Form {...s1}>
                <form id="wizard-step-1" onSubmit={s1.handleSubmit((d) => { setStep1Data(d); setStep(2); })} className="space-y-5">
                  <FormField control={s1.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-text-primary">Plan Name <span className="text-error">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pro Monthly" className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={s1.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-text-primary">Description</FormLabel>
                      <FormControl>
                        <textarea {...field} rows={3} placeholder="What's included in this plan..." className="flex w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <label className="text-sm font-semibold text-text-primary mb-2 block">Accent Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {ACCENT_COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => s1.setValue('color', c)}
                          className={cn('w-7 h-7 rounded-full border-2 transition-all cursor-pointer', s1.watch('color') === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105')}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 2 – Pricing */}
            {step === 2 && (
              <Form {...s2}>
                <form id="wizard-step-2" onSubmit={s2.handleSubmit((d) => { setStep2Data(d); setStep(3); })} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={s2.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-text-primary">Price (₹) <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} placeholder="39.00" className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={s2.control} name="joiningFee" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-text-primary">Joining Fee (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} placeholder="0.00" className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex gap-6">
                    <FormField control={s2.control} name="isPopular" render={({ field }) => (
                      <FormItem className="flex items-center gap-2.5 space-y-0">
                        <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary cursor-pointer" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer text-text-primary">Mark as Popular</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={s2.control} name="isDefault" render={({ field }) => (
                      <FormItem className="flex items-center gap-2.5 space-y-0">
                        <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary cursor-pointer" /></FormControl>
                        <FormLabel className="font-normal cursor-pointer text-text-primary">Set as Default</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3 – Duration */}
            {step === 3 && (
              <Form {...s3}>
                <form id="wizard-step-3" onSubmit={s3.handleSubmit((d) => { setStep3Data(d); setStep(4); })} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={s3.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-text-primary">Duration <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min={1} className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={s3.control} name="durationType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-text-primary">Duration Type <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer">
                            {Object.entries(DURATION_TYPE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-hover border border-border-default">
                    <p className="text-sm text-text-muted">Preview: <span className="font-semibold text-text-primary">{s3.watch('duration')} {DURATION_TYPE_LABELS[s3.watch('durationType')]}</span></p>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4 – Features + Review */}
            {step === 4 && (
              <Form {...s4}>
                <form id="wizard-step-4" onSubmit={s4.handleSubmit(handleFinalSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    {fields.map((field, i) => (
                      <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-surface hover:border-border-hover transition-colors">
                        <input type="checkbox" {...s4.register(`features.${i}.included`)} className="w-4 h-4 accent-primary flex-shrink-0 cursor-pointer" />
                        <input {...s4.register(`features.${i}.label`)} className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none" placeholder="Feature label..." />
                        <button type="button" onClick={() => remove(i)} className="text-text-muted hover:text-error transition-colors p-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => append({ id: `feat-${Date.now()}`, label: '', included: false })}
                      className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mt-1 cursor-pointer">
                      <Plus className="w-4 h-4" /> Add feature
                    </button>
                  </div>

                  {/* Review summary */}
                  <div className="rounded-xl border border-border-default bg-surface-hover p-4 space-y-2.5 text-sm">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Review</p>
                    {[
                      ['Name', step1Data.name],
                      ['Price', `₹${step2Data.price}`],
                      ['Duration', `${step3Data.duration} ${step3Data.durationType ? DURATION_TYPE_LABELS[step3Data.durationType] : ''}`],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex justify-between">
                        <span className="text-text-muted">{label}</span>
                        <span className="font-semibold text-text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                </form>
              </Form>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border-default shrink-0">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 min-h-[44px] border-border-default text-text-secondary hover:text-text-primary"
          onClick={step === 1 ? onCancel : () => setStep((p) => (p - 1) as WizardStep)}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 4 ? (
          <Button
            type="submit"
            size="lg"
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            form={`wizard-step-${step}`}
          >
            Continue
          </Button>
        ) : (
          <LoadingButton
            size="lg"
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            type="submit"
            form="wizard-step-4"
            isLoading={createPlan.isPending}
            loadingText="Creating..."
          >
            Create Plan
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
