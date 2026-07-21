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
  const [hasJoiningFee, setHasJoiningFee] = useState(false);
  const createPlan = useCreatePlan();

  const s1 = useForm<CreatePlanStep1>({ resolver: zodResolver(createPlanStep1Schema) });
  const s2 = useForm<CreatePlanStep2>({
    resolver: zodResolver(createPlanStep2Schema),
    defaultValues: { price: '' as any, joiningFee: '' as any, isDefault: false, isPopular: false }
  });
  const s3 = useForm<CreatePlanStep3>({
    resolver: zodResolver(createPlanStep3Schema),
    defaultValues: { duration: 1, durationType: 'months' }
  });
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
      if (d.step2) {
        setStep2Data(d.step2);
        s2.reset(d.step2);
        if (d.step2.joiningFee && Number(d.step2.joiningFee) > 0) {
          setHasJoiningFee(true);
        }
      }
      if (d.step3) { setStep3Data(d.step3); s3.reset(d.step3); }
      if (d.currentStep) setStep(d.currentStep);
    } catch { /* ignore */ }
  }, []);

  // Autosave
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step1: step1Data, step2: step2Data, step3: step3Data, currentStep: step }));
  }, [step1Data, step2Data, step3Data, step]);

  const handleFinalSubmit = async (s4d: CreatePlanStep4) => {
    const payload: CreatePlanData = {
      ...step1Data as CreatePlanStep1,
      ...step2Data as CreatePlanStep2,
      ...step3Data as CreatePlanStep3,
      ...s4d
    };
    localStorage.removeItem(DRAFT_KEY);
    await createPlan.mutateAsync(payload);
    onSuccess();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 font-mono">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6 px-1 shrink-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs font-mono font-bold border-2 transition-all duration-200 touch-target',
                step > s.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : step === s.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-105'
                  : 'bg-surface text-text-muted border-border-default',
              )}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn(
                'text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:block transition-colors duration-200',
                step === s.id ? 'text-primary' : 'text-text-muted',
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 transition-all duration-200', step > s.id ? 'bg-primary' : 'bg-border-default/60')} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>

            {/* Step 1 – Basic Info */}
            {step === 1 && (
              <Form {...s1}>
                <form id="wizard-step-1" onSubmit={s1.handleSubmit((d) => { setStep1Data(d); setStep(2); })} className="space-y-5">
                  <FormField control={s1.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Plan Name <span className="text-error">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Pro Monthly Fitness" className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={s1.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Description</FormLabel>
                      <FormControl>
                        <textarea {...field} rows={3} placeholder="What's included in this plan..." className="flex w-full rounded-xl border border-border-default/80 bg-surface/90 px-3.5 py-2.5 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all resize-none font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-text-primary font-mono mb-2.5 block">Accent Color</label>
                    <div className="flex gap-2.5 flex-wrap">
                      {ACCENT_COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => s1.setValue('color', c)}
                          className={cn('w-9 h-9 sm:w-8 sm:h-8 rounded-xl border-2 transition-all cursor-pointer touch-target', s1.watch('color') === c ? 'border-primary scale-110 shadow-xs' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100')}
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
                <form
                  id="wizard-step-2"
                  onSubmit={s2.handleSubmit((d) => {
                    const finalStep2Data = {
                      ...d,
                      joiningFee: hasJoiningFee ? (Number(d.joiningFee) || 0) : 0,
                    };
                    setStep2Data(finalStep2Data);
                    setStep(3);
                  })}
                  className="space-y-5"
                >
                  <div className="space-y-4">
                    <FormField control={s2.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Price (₹) <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={0.01} placeholder="2999.00" className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border-default/60 bg-surface-hover/30 hover:bg-surface-hover/60 transition-colors">
                      <input
                        type="checkbox"
                        id="hasJoiningFee"
                        checked={hasJoiningFee}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasJoiningFee(checked);
                          if (!checked) {
                            s2.setValue('joiningFee', '' as any);
                          }
                        }}
                        className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target"
                      />
                      <label htmlFor="hasJoiningFee" className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">
                        Charge a one-time joining fee for this plan
                      </label>
                    </div>

                    <AnimatePresence>
                      {hasJoiningFee && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <FormField control={s2.control} name="joiningFee" render={({ field }) => (
                            <FormItem className="pt-2">
                              <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Joining Fee (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} step={0.01} placeholder="500.00" className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormField control={s2.control} name="isPopular" render={({ field }) => (
                      <FormItem className="flex items-center gap-3 p-3 rounded-xl border border-border-default/60 bg-surface-hover/30 hover:bg-surface-hover/60 transition-colors space-y-0">
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target" />
                        </FormControl>
                        <FormLabel className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">Mark as Popular Tier</FormLabel>
                      </FormItem>
                    )} />
                    <FormField control={s2.control} name="isDefault" render={({ field }) => (
                      <FormItem className="flex items-center gap-3 p-3 rounded-xl border border-border-default/60 bg-surface-hover/30 hover:bg-surface-hover/60 transition-colors space-y-0">
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target" />
                        </FormControl>
                        <FormLabel className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">Set as Default Selection</FormLabel>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={s3.control} name="duration" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Duration Count <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min={1} className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={s3.control} name="durationType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Duration Unit <span className="text-error">*</span></FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-11 min-h-[44px] w-full rounded-xl border border-border-default/80 bg-surface/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all cursor-pointer">
                            {Object.entries(DURATION_TYPE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="p-4 rounded-xl bg-surface-hover/50 border border-border-default/60">
                    <p className="text-xs sm:text-sm text-text-muted font-mono">
                      Cycle Summary: <span className="font-bold text-text-primary">{s3.watch('duration')} {DURATION_TYPE_LABELS[s3.watch('durationType')]}</span>
                    </p>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4 – Features + Review */}
            {step === 4 && (
              <Form {...s4}>
                <form id="wizard-step-4" onSubmit={s4.handleSubmit(handleFinalSubmit)} className="space-y-6">
                  <div className="space-y-2.5">
                    {fields.map((field, i) => (
                      <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default/70 bg-surface/90 hover:border-border-hover/80 transition-colors">
                        <input type="checkbox" {...s4.register(`features.${i}.included`)} className="w-5 h-5 accent-primary flex-shrink-0 cursor-pointer rounded touch-target" />
                        <input {...s4.register(`features.${i}.label`)} className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-text-primary focus:outline-none" placeholder="Feature description..." />
                        <button type="button" onClick={() => remove(i)} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-error transition-colors cursor-pointer rounded-lg touch-target shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => append({ id: `feat-${Date.now()}`, label: '', included: true })}
                      className="flex items-center justify-center gap-2 px-4 h-11 w-full border border-dashed border-border-default hover:border-primary/50 rounded-xl text-xs font-mono font-bold text-text-secondary hover:text-primary transition-all cursor-pointer min-h-[44px] touch-target"
                    >
                      <Plus className="w-4 h-4" /> Add Feature Item
                    </button>
                  </div>

                  {/* Review summary */}
                  <div className="rounded-2xl border border-border-default/80 bg-surface-hover/40 p-4 sm:p-5 space-y-2.5 text-xs sm:text-sm font-mono">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Plan Summary Review</p>
                    {[
                      ['Name', step1Data.name || '—'],
                      ['Price', `₹${(step2Data.price || 0).toLocaleString()}`],
                      ['Duration', `${step3Data.duration} ${step3Data.durationType ? DURATION_TYPE_LABELS[step3Data.durationType] : ''}`],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex justify-between py-1 border-b border-border-default/40 last:border-b-0">
                        <span className="text-text-muted">{label}</span>
                        <span className="font-bold text-text-primary">{value}</span>
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
      <div className="flex items-center gap-3 pt-5 mt-5 border-t border-border-default/60 shrink-0">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 min-h-[44px] border-border-default/80 text-text-secondary hover:text-text-primary font-mono font-bold text-xs sm:text-sm rounded-xl touch-target cursor-pointer"
          onClick={step === 1 ? onCancel : () => setStep((p) => (p - 1) as WizardStep)}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < 4 ? (
          <Button
            type="submit"
            size="lg"
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-mono font-bold text-xs sm:text-sm rounded-xl touch-target cursor-pointer shadow-xs active:scale-95"
            form={`wizard-step-${step}`}
          >
            Continue
          </Button>
        ) : (
          <LoadingButton
            size="lg"
            className="flex-1 min-h-[44px] bg-primary text-primary-foreground hover:opacity-90 font-mono font-bold text-xs sm:text-sm rounded-xl touch-target cursor-pointer shadow-xs active:scale-95"
            type="submit"
            form="wizard-step-4"
            isLoading={createPlan.isPending}
            loadingText="Creating Plan..."
          >
            Create Plan
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
