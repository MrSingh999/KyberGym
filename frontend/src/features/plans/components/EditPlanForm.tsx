import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { editPlanSchema, EditPlanData } from '../schemas/plan.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms/Form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MembershipPlan, DURATION_TYPE_LABELS } from '../types';

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
  const form = useForm<EditPlanData>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: {
      name: plan.name,
      description: plan.description ?? '',
      color: plan.color ?? '',
      price: plan.price,
      joiningFee: plan.joiningFee ?? 0,
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

  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('You have unsaved changes. Discard them and leave?')) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Basic Info */}
        <section className="space-y-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Basic Information</h3>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-text-primary">Plan Name <span className="text-error">*</span></FormLabel>
              <FormControl>
                <Input className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-text-primary">Description</FormLabel>
              <FormControl>
                <textarea {...field} rows={3} className="flex w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div>
            <label className="text-sm font-semibold text-text-primary mb-2 block">Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => form.setValue('color', c, { shouldDirty: true })}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${form.watch('color') === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Price (₹) <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="joiningFee" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Joining Fee (₹)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step={0.01} className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="flex gap-6">
            <FormField control={form.control} name="isPopular" render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary cursor-pointer" /></FormControl>
                <FormLabel className="font-normal cursor-pointer text-text-primary">Mark as Popular</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="isDefault" render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary cursor-pointer" /></FormControl>
                <FormLabel className="font-normal cursor-pointer text-text-primary">Set as Default</FormLabel>
              </FormItem>
            )} />
          </div>
        </section>

        {/* Duration */}
        <section className="space-y-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="duration" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Duration <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <Input type="number" min={1} className="h-11 border-border-default focus-visible:border-primary focus-visible:ring-primary/20" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="durationType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-text-primary">Type <span className="text-error">*</span></FormLabel>
                <FormControl>
                  <select {...field} className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all cursor-pointer">
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
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Features</h3>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-surface hover:border-border-hover transition-colors">
                <input type="checkbox" {...form.register(`features.${i}.included`)} className="w-4 h-4 accent-primary flex-shrink-0 cursor-pointer" />
                <input {...form.register(`features.${i}.label`)} className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none" />
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
        </section>

        <div className="pt-4 border-t border-border-default flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isSubmitting}
            size="lg"
            className="min-h-[44px] px-6 bg-primary text-primary-foreground hover:opacity-90 font-semibold disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
