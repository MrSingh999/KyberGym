import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { editPlanSchema, EditPlanData } from '../schemas/plan.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms/Form';
import { Input } from '@/components/ui/input';
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
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Basic Information</h3>

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Plan Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>Description</FormLabel><FormControl>
              <textarea {...field} rows={3} className="flex w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none" />
            </FormControl><FormMessage /></FormItem>
          )} />
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => form.setValue('color', c, { shouldDirty: true })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.watch('color') === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-5">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>Price ($) *</FormLabel><FormControl>
                <Input type="number" min={0} step={0.01} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="joiningFee" render={({ field }) => (
              <FormItem><FormLabel>Joining Fee ($)</FormLabel><FormControl>
                <Input type="number" min={0} step={0.01} {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="flex gap-6">
            <FormField control={form.control} name="isPopular" render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary" /></FormControl>
                <FormLabel className="font-normal cursor-pointer">Mark as Popular</FormLabel>
              </FormItem>
            )} />
            <FormField control={form.control} name="isDefault" render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 accent-primary" /></FormControl>
                <FormLabel className="font-normal cursor-pointer">Set as Default</FormLabel>
              </FormItem>
            )} />
          </div>
        </section>

        {/* Duration */}
        <section className="space-y-5">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="duration" render={({ field }) => (
              <FormItem><FormLabel>Duration *</FormLabel><FormControl>
                <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
              </FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="durationType" render={({ field }) => (
              <FormItem><FormLabel>Type *</FormLabel><FormControl>
                <select {...field} className="flex h-11 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  {Object.entries(DURATION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </section>

        {/* Features */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Features</h3>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-3 p-3 rounded-xl border border-default bg-surface hover:border-hover transition-colors">
                <input type="checkbox" {...form.register(`features.${i}.included`)} className="w-4 h-4 accent-primary flex-shrink-0" />
                <input {...form.register(`features.${i}.label`)} className="flex-1 bg-transparent text-sm text-primary focus:outline-none" />
                <button type="button" onClick={() => remove(i)} className="text-muted hover:text-destructive transition-colors p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ id: `feat-${Date.now()}`, label: '', included: false })}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mt-1">
              <Plus className="w-4 h-4" /> Add feature
            </button>
          </div>
        </section>

        <div className="pt-4 border-t border-subtle flex justify-end">
          <button type="submit" disabled={!isDirty || isSubmitting}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
            {isSubmitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Form>
  );
}
