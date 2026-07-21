import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle2, Search } from 'lucide-react';
import { addDays, parseISO } from 'date-fns';
import {
  collectStep1Schema, CollectStep1,
  collectStep2Schema, CollectStep2,
  collectStep3Schema, CollectStep3,
  CollectPaymentData
} from '../schemas/payment.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/forms/Form';
import { Input } from '@/components/ui/input';
import { PAYMENT_METHOD_LABELS } from '../types';
import { cn } from '@/lib/utils';
import { useCollectPayment } from '../hooks/usePayments';
import { apiClient } from '@/lib/apiClient';
import { usePlans } from '@/features/plans/hooks/usePlans';

const STEPS = [
  { id: 1, label: 'Member' },
  { id: 2, label: 'Membership' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Review' },
];

const DRAFT_KEY = 'kybergym_payment_draft';

interface MemberResult {
  id: string;
  _id?: string;
  fullName: string;
  phone?: string;
}

export function CollectPaymentWizard({ onSuccess, onCancel }: { onSuccess: (id: string) => void; onCancel: () => void }) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s1Data, setS1Data] = useState<Partial<CollectStep1>>({});
  const [s2Data, setS2Data] = useState<Partial<CollectStep2>>({});
  const [s3Data, setS3Data] = useState<Partial<CollectStep3>>({});

  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const collectPayment = useCollectPayment();
  const { data: plansData } = usePlans({ pageSize: 100 });
  const activePlans = (plansData?.data || []).filter(p => p.status === 'active');

  const s1 = useForm<CollectStep1>({ resolver: zodResolver(collectStep1Schema) });
  const s2 = useForm<CollectStep2>({ resolver: zodResolver(collectStep2Schema) });
  const s3 = useForm<CollectStep3>({
    resolver: zodResolver(collectStep3Schema),
    defaultValues: { paymentDate: new Date().toISOString().split('T')[0], amount: 0, discount: 0, finalAmount: 0 },
  });

  const amount = s3.watch('amount');
  const discount = s3.watch('discount');
  useEffect(() => {
    s3.setValue('finalAmount', Math.max(0, (amount || 0) - (discount || 0)));
  }, [amount, discount, s3]);

  const doMemberSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setMemberResults([]); return; }
    setMemberSearching(true);
    try {
      const res = await apiClient.get('/members', { params: { search: q, limit: 10 } });
      setMemberResults(res.data.data || []);
    } catch { setMemberResults([]); }
    finally { setMemberSearching(false); }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doMemberSearch(memberSearch), 300);
    return () => clearTimeout(searchTimer.current);
  }, [memberSearch, doMemberSearch]);

  const selectMember = (m: MemberResult) => {
    s1.setValue('memberId', m.id || m._id);
    s1.setValue('memberName', m.fullName);
    setMemberSearch(m.fullName);
    setMemberResults([]);
  };

  const selectPlan = (planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    if (!plan) return;
    s2.setValue('planId', planId);
    s2.setValue('planName', plan.name);
    const startDate = new Date().toISOString().split('T')[0];
    s2.setValue('membershipStartDate', startDate);

    const durationMap: Record<string, number> = {
      days: plan.duration,
      weeks: plan.duration * 7,
      months: plan.duration * 30,
      years: plan.duration * 365,
    };
    const endDate = addDays(parseISO(startDate), durationMap[plan.durationType] || 30);
    s2.setValue('membershipEndDate', endDate.toISOString().split('T')[0]);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.s1) { setS1Data(d.s1); s1.reset(d.s1); if (d.s1.memberName) setMemberSearch(d.s1.memberName); }
        if (d.s2) { setS2Data(d.s2); s2.reset(d.s2); }
        if (d.s3) { setS3Data(d.s3); s3.reset(d.s3); }
        if (d.step) setStep(d.step);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (step < 5) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ s1: s1Data, s2: s2Data, s3: s3Data, step }));
    }
  }, [s1Data, s2Data, s3Data, step]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...s1Data, ...s2Data, ...s3Data } as CollectPaymentData;
      const res = await collectPayment.mutateAsync(payload);
      localStorage.removeItem(DRAFT_KEY);
      setStep(5);
      setTimeout(() => onSuccess(res.id), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {step < 5 && (
        <div className="flex items-center mb-8 px-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition-all',
                  step > s.id ? 'bg-primary border-primary text-primary-foreground' :
                  step === s.id ? 'bg-primary/10 border-primary text-primary' :
                  'bg-surface-hover border-border-default text-text-muted',
                )}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={cn('text-[10px] font-medium hidden sm:block', step === s.id ? 'text-text-primary' : 'text-text-muted')}>{s.label}</span>
              </div>
                  {i < STEPS.length - 1 && <div className={cn('flex-1 h-px mx-2', step > s.id ? 'bg-primary' : 'bg-border-default')} />}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>

            {/* Step 1: Member Search */}
            {step === 1 && (
              <Form {...s1}>
                <form id="w-s1" onSubmit={s1.handleSubmit((d) => { setS1Data(d); setStep(2); })} className="space-y-4">
                  <FormField control={s1.control} name="memberId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Member *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                          <input
                            placeholder="Search by name, phone, or code..."
                            className="flex h-11 w-full rounded-lg border border-border-default bg-surface pl-10 pr-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={memberSearch}
                            onChange={(e) => { setMemberSearch(e.target.value); field.onChange(''); }}
                          />
                        </div>
                      </FormControl>
                      {memberSearching && <p className="text-xs text-text-muted mt-1">Searching...</p>}
                      {memberResults.length > 0 && (
                        <div className="mt-2 border border-border-default rounded-xl bg-surface overflow-hidden max-h-48 overflow-y-auto">
                          {memberResults.map((m) => (
                            <button
                              key={m.id || m._id}
                              type="button"
                              onClick={() => selectMember(m)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-surface-hover transition-colors border-b border-border-default last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                {m.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-text-primary truncate">{m.fullName}</p>
                                <p className="text-xs text-text-muted">{m.phone}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {field.value && (
                        <p className="text-xs text-text-secondary mt-1">Selected: {s1.watch('memberName')}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                </form>
              </Form>
            )}

            {/* Step 2: Plan Selection */}
            {step === 2 && (
              <Form {...s2}>
                <form id="w-s2" onSubmit={s2.handleSubmit((d) => { setS2Data(d); setStep(3); })} className="space-y-4">
                  <FormField control={s2.control} name="planId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Plan *</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => selectPlan(e.target.value)}
                          className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary"
                        >
                          <option value="">Select a plan...</option>
                          {activePlans.map(p => (
                            <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/{p.duration} {p.durationType}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={s2.control} name="membershipStartDate" render={({ field }) => (
                      <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={s2.control} name="membershipEndDate" render={({ field }) => (
                      <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Form {...s3}>
                <form id="w-s3" onSubmit={s3.handleSubmit((d) => { setS3Data(d); setStep(4); })} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={s3.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel>Amount (₹) *</FormLabel><FormControl><Input type="number" step={0.01} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={s3.control} name="discount" render={({ field }) => (
                      <FormItem><FormLabel>Discount (₹)</FormLabel><FormControl><Input type="number" step={0.01} {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <div className="bg-surface-hover border border-border-default rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-text-primary">Final Amount</span>
                    <span className="text-xl font-bold font-heading text-text-primary">₹{s3.watch('finalAmount').toFixed(2)}</span>
                  </div>

                  <FormField control={s3.control} name="paymentMethod" render={({ field }) => (
                    <FormItem><FormLabel>Payment Method *</FormLabel><FormControl>
                      <select {...field} className="flex h-11 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-text-primary">
                        <option value="">Select method...</option>
                        {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={s3.control} name="paymentDate" render={({ field }) => (
                      <FormItem><FormLabel>Payment Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={s3.control} name="transactionReference" render={({ field }) => (
                      <FormItem><FormLabel>Transaction Ref (Optional)</FormLabel><FormControl><Input placeholder="TXN-..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border-default bg-surface p-4 space-y-3 text-sm">
                  <h4 className="font-semibold text-text-primary border-b border-border-default pb-2 mb-2">Summary</h4>
                  <div className="flex justify-between"><span className="text-text-muted">Member</span><span className="font-medium text-text-primary">{s1Data.memberName}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Plan</span><span className="font-medium text-text-primary">{s2Data.planName}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Method</span><span className="font-medium text-text-primary">{s3Data.paymentMethod ? PAYMENT_METHOD_LABELS[s3Data.paymentMethod] : ''}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Subtotal</span><span className="font-medium text-text-primary">₹{s3Data.amount}</span></div>
                  {Number(s3Data.discount) > 0 && (
                    <div className="flex justify-between"><span className="text-text-muted">Discount</span><span className="font-medium text-error">-₹{s3Data.discount}</span></div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border-default"><span className="font-semibold">Total Paid</span><span className="font-bold text-text-primary">₹{s3Data.finalAmount}</span></div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className="font-heading font-bold text-xl text-text-primary mb-2">Payment Collected</h3>
                <p className="text-text-muted text-sm">Receipt is being generated...</p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      {step < 5 && (
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-border-default">
          <button type="button" onClick={step === 1 ? onCancel : () => setStep(p => p - 1)} className="px-4 py-2.5 text-sm font-medium border border-border-default rounded-xl hover:bg-surface-hover min-h-[44px]">
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          {step < 4 ? (
            <button type="submit" form={`w-s${step}`} className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 min-h-[44px]">
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleFinalSubmit} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2 min-h-[44px]">
              {isSubmitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
