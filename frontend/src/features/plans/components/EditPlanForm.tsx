import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { editPlanSchema, EditPlanData } from '../schemas/plan.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms/Form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MembershipPlan, DURATION_TYPE_LABELS } from '../types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

const ACCENT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f59e0b', '#10b981', '#3b82f6', '#14b8a6',
];

interface EditPlanFormProps {
  plan: MembershipPlan;
  onSubmit: (data: EditPlanData) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditPlanForm({ plan, onSubmit, isSubmitting }: EditPlanFormProps) {
  const [hasJoiningFee, setHasJoiningFee] = useState(!!plan.joiningFee && plan.joiningFee > 0);

  const form = useForm<EditPlanData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description ?? '',
      color: plan.color ?? '',
      price: plan.price,
      joiningFee: plan.joiningFee || ('' as any),
      isDefault: plan.isDefault,
      isPopular: plan.isPopular,
      duration: plan.duration,
      durationType: plan.durationType,
      features: plan.features,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'features' });
  const { isDirty } = form.formState;

  // Unsaved changes protection
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // Clean form on mount to prevent dynamic list mapping or UUIDs from flagging dirty state falsely
  useEffect(() => {
    form.reset(form.getValues());
  }, []);

  const handleFormSubmit = async (data: EditPlanData) => {
    const payload = {
      ...data,
      joiningFee: hasJoiningFee ? (Number(data.joiningFee) || 0) : 0,
    };
    await onSubmit(payload);
    form.reset(data); // Clear dirty state so navigation blocker doesn't intercept save
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">

        {/* Basic Info */}
        <section className="space-y-5">
          <div className="pb-2 border-b border-border-default/60">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Basic Information</h3>
          </div>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Plan Name <span className="text-error">*</span></FormLabel>
              <FormControl>
                <Input className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Description</FormLabel>
              <FormControl>
                <textarea {...field} rows={3} className="flex w-full rounded-xl border border-border-default/80 bg-surface/90 px-3.5 py-2.5 text-xs sm:text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all resize-none font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div>
            <label className="text-xs sm:text-sm font-bold text-text-primary font-mono mb-2.5 block">Accent Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => form.setValue('color', c, { shouldDirty: true })}
                  className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl border-2 transition-all cursor-pointer touch-target ${form.watch('color') === c ? 'border-primary scale-110 shadow-xs' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-5">
          <div className="pb-2 border-b border-border-default/60">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Pricing & Billing</h3>
          </div>

          <div className="space-y-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Price (₹) <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
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
                  form.setValue('joiningFee', checked ? plan.joiningFee || ('' as any) : ('' as any), { shouldDirty: true });
                }}
                className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target"
              />
              <label htmlFor="hasJoiningFee" className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">
                Charge a one-time joining fee for this plan
              </label>
            </div>

            {hasJoiningFee && (
              <FormField control={form.control} name="joiningFee" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Joining Fee (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <FormField control={form.control} name="isPopular" render={({ field }) => (
              <FormItem className="flex items-center gap-3 p-3 rounded-xl border border-border-default/60 bg-surface-hover/30 hover:bg-surface-hover/60 transition-colors space-y-0">
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target" />
                </FormControl>
                <FormLabel className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">Mark as Popular Tier</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="isDefault" render={({ field }) => (
              <FormItem className="flex items-center gap-3 p-3 rounded-xl border border-border-default/60 bg-surface-hover/30 hover:bg-surface-hover/60 transition-colors space-y-0">
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-5 h-5 accent-primary cursor-pointer rounded shrink-0 touch-target" />
                </FormControl>
                <FormLabel className="text-xs sm:text-sm font-bold font-mono cursor-pointer text-text-primary">Set as Default Selection</FormLabel>
              </FormItem>
            )} />
          </div>
        </section>

        {/* Duration */}
        <section className="space-y-5">
          <div className="pb-2 border-b border-border-default/60">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Validity & Cycle</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="duration" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Duration Count <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min={1} className="h-11 min-h-[44px] border-border-default/80 bg-surface/90 font-mono text-xs sm:text-sm rounded-xl focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50" {...field} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="durationType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-bold text-text-primary font-mono">Duration Unit <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <select {...field} className="flex h-11 min-h-[44px] w-full rounded-xl border border-border-default/80 bg-surface/90 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all cursor-pointer">
                    {Object.entries(DURATION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border-default/60 flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider font-mono">Plan Features & Perks</h3>
            <span className="text-[10px] font-mono text-text-muted font-bold">{fields.length} items</span>
          </div>

          <div className="space-y-2.5">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default/70 bg-surface/90 hover:border-border-hover/80 transition-colors">
                <input type="checkbox" {...form.register(`features.${i}.included`)} className="w-5 h-5 accent-primary flex-shrink-0 cursor-pointer rounded touch-target" />
                <input {...form.register(`features.${i}.label`)} placeholder="Feature description..." className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-text-primary focus:outline-none" />
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
        </section>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border-default/60 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            size="lg"
            className="min-h-[44px] px-6 bg-primary text-primary-foreground hover:opacity-90 font-mono font-bold text-xs sm:text-sm rounded-xl disabled:opacity-50 touch-target shadow-xs cursor-pointer active:scale-95"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>

    <AlertDialog open={blocker.state === 'blocked'}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes on this page. Leaving this page will discard all unsaved edits. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset()}>
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-error text-error-foreground hover:bg-error/90 animate-none"
            onClick={() => blocker.proceed()}
          >
            Discard & Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
