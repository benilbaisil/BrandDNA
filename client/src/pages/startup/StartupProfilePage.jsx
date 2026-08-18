import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Globe,
  MapPin,
  Lightbulb,
  Target,
  Flag,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Trash2,
  Camera,
  Share2,
  Briefcase,
  Play,
  Link,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { startupService } from '../../services/startupService';
import { useToast } from '../../context/ToastContext';

// ── Constants ──────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Startup',
  'Small Business',
  'Existing Business',
  'Individual / Entrepreneur',
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Education', 'E-commerce', 'Finance',
  'Food & Beverage', 'Travel & Tourism', 'Fashion', 'Retail',
  'Manufacturing', 'Media & Entertainment', 'Real Estate', 'Agriculture',
  'Logistics', 'Professional Services', 'Other',
];

const BUSINESS_STAGES = ['Idea', 'Pre-launch', 'Launched', 'Growth'];

const BUSINESS_GOAL_OPTIONS = [
  'Launch a new business',
  'Launch a new product',
  'Grow an existing business',
  'Increase sales',
  'Build brand awareness',
  'Enter a new market',
  'Rebrand an existing business',
  'Improve customer reach',
  'Other',
];

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Camera,    placeholder: 'https://instagram.com/yourbusiness' },
  { key: 'facebook',  label: 'Facebook',  icon: Share2,    placeholder: 'https://facebook.com/yourbusiness' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: Briefcase, placeholder: 'https://linkedin.com/company/...' },
  { key: 'youtube',   label: 'YouTube',   icon: Play,      placeholder: 'https://youtube.com/@yourbusiness' },
  { key: 'other',     label: 'Other',     icon: Link,      placeholder: 'https://...' },
];

const PROGRESS_STEPS = [
  { n: '01', label: 'Business Details' },
  { n: '02', label: 'Brand Intelligence' },
  { n: '03', label: 'Product Strategy' },
  { n: '04', label: 'Customer Intelligence' },
  { n: '05', label: 'Marketing' },
  { n: '06', label: 'Reports' },
];

// ── Zod Schema ─────────────────────────────────────────────────────────────────

const businessSchema = z
  .object({
    businessType: z.string().min(1, 'Please select a business type'),
    industry: z.string().min(1, 'Please select an industry'),
    otherIndustry: z.string().optional(),
    businessStage: z.string().min(1, 'Please select a business stage'),
    country: z.string().min(1, 'Country is required'),
    region: z.string().optional(),
    businessDescription: z
      .string()
      .min(20, 'Please describe your business in at least 20 characters'),
    problemStatement: z
      .string()
      .min(10, 'Please describe the problem in at least 10 characters'),
    businessGoals: z
      .array(z.string())
      .min(1, 'Please select at least one business goal'),
    otherGoal: z.string().optional(),
    website: z.string().optional().or(z.literal('')),
    socialMediaLinks: z
      .object({
        instagram: z.string().optional().or(z.literal('')),
        facebook:  z.string().optional().or(z.literal('')),
        linkedin:  z.string().optional().or(z.literal('')),
        youtube:   z.string().optional().or(z.literal('')),
        other:     z.string().optional().or(z.literal('')),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.industry === 'Other' && !data.otherIndustry?.trim()) {
      ctx.addIssue({ path: ['otherIndustry'], code: z.ZodIssueCode.custom, message: 'Please specify your industry' });
    }
    if (data.businessGoals.includes('Other') && !data.otherGoal?.trim()) {
      ctx.addIssue({ path: ['otherGoal'], code: z.ZodIssueCode.custom, message: 'Please describe your other goal' });
    }
  });

// ── Helpers ────────────────────────────────────────────────────────────────────

const inputCls = (error) =>
  `w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border px-3.5 py-2.5 transition-all duration-150 outline-none ${
    error
      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
      : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
  }`;

const FieldError = ({ message }) =>
  message ? (
    <span className="flex items-center gap-1 text-xs font-medium text-rose-500 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" /> {message}
    </span>
  ) : null;

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
    {children}
    {required && <span className="text-rose-500 ml-0.5">*</span>}
  </label>
);

// ── Main Component ─────────────────────────────────────────────────────────────

export const StartupProfilePage = () => {
  const { addToast } = useToast();
  const [profileExists, setProfileExists] = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessType: '',
      industry: '',
      otherIndustry: '',
      businessStage: '',
      country: '',
      region: '',
      businessDescription: '',
      problemStatement: '',
      businessGoals: [],
      otherGoal: '',
      website: '',
      socialMediaLinks: { instagram: '', facebook: '', linkedin: '', youtube: '', other: '' },
    },
  });

  const watchedIndustry     = watch('industry');
  const watchedStage        = watch('businessStage');
  const watchedGoals        = watch('businessGoals');
  const showExistingSection =
    watchedStage === 'Launched' || watchedStage === 'Growth';

  // ── Fetch existing profile ────────────────────────────────────────────────

  const loadProfile = async () => {
    setFetching(true);
    try {
      const res = await startupService.getProfile();
      if (res.success && res.data) {
        setProfileExists(true);
        reset({
          businessType:        res.data.businessType        || '',
          industry:            res.data.industry            || '',
          otherIndustry:       res.data.otherIndustry       || '',
          businessStage:       res.data.businessStage       || '',
          country:             res.data.country             || '',
          region:              res.data.region              || '',
          businessDescription: res.data.businessDescription || res.data.companyDescription || '',
          problemStatement:    res.data.problemStatement    || '',
          businessGoals:       Array.isArray(res.data.businessGoals) ? res.data.businessGoals : [],
          otherGoal:           res.data.otherGoal           || '',
          website:             res.data.website             || '',
          socialMediaLinks: {
            instagram: res.data.socialMediaLinks?.instagram || '',
            facebook:  res.data.socialMediaLinks?.facebook  || '',
            linkedin:  res.data.socialMediaLinks?.linkedin  || '',
            youtube:   res.data.socialMediaLinks?.youtube   || '',
            other:     res.data.socialMediaLinks?.other     || '',
          },
        });
      } else {
        setProfileExists(false);
      }
    } catch {
      setProfileExists(false);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data) => {
    setSaving(true);
    const payload = {
      businessType:        data.businessType,
      industry:            data.industry,
      otherIndustry:       data.otherIndustry || '',
      businessStage:       data.businessStage,
      country:             data.country,
      region:              data.region || '',
      businessDescription: data.businessDescription,
      problemStatement:    data.problemStatement,
      businessGoals:       data.businessGoals,
      otherGoal:           data.otherGoal || '',
      website:             data.website || '',
      socialMediaLinks:    data.socialMediaLinks || {},
    };

    try {
      if (profileExists) {
        const res = await startupService.updateProfile(payload);
        if (res.success) addToast('Business profile updated successfully!', 'success');
      } else {
        const res = await startupService.createProfile(payload);
        if (res.success) {
          setProfileExists(true);
          addToast('Business profile saved! BrandDNA AI is ready.', 'success');
        }
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your business profile?')) return;
    setDeleting(true);
    try {
      const res = await startupService.deleteProfile();
      if (res.success) {
        setProfileExists(false);
        reset();
        addToast('Business profile deleted', 'info');
      }
    } catch {
      addToast('Failed to delete profile', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading your profile...</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left pb-16">

      {/* Progress Stepper */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {PROGRESS_STEPS.map((step, idx) => (
          <React.Fragment key={step.n}>
            <div className={`flex flex-col items-center shrink-0 ${idx === 0 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors ${
                idx === 0
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-300 text-slate-400'
              }`}>
                {idx === 0 ? <Check className="w-3.5 h-3.5" /> : step.n}
              </div>
              <span className={`text-[9px] font-semibold mt-1 whitespace-nowrap ${idx === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div className={`h-px flex-1 min-w-4 mx-1 mb-4 ${idx === 0 ? 'bg-blue-200' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
            {profileExists ? 'Profile Active' : 'New Setup'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Tell us about your business
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Give us the essentials. BrandDNA AI will build the intelligence around your business.
          </p>
        </div>

        {profileExists && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            isLoading={deleting}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 self-start"
            icon={Trash2}
          >
            Delete Profile
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Section 1: Business Overview */}
        <Card className="border-slate-200/90 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" /> Business Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Business Type</FieldLabel>
              <select {...register('businessType')} className={inputCls(errors.businessType)}>
                <option value="">Select type...</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <FieldError message={errors.businessType?.message} />
            </div>

            <div>
              <FieldLabel required>Industry</FieldLabel>
              <select {...register('industry')} className={inputCls(errors.industry)}>
                <option value="">Select industry...</option>
                {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
              </select>
              <FieldError message={errors.industry?.message} />
            </div>
          </div>

          <AnimatePresence>
            {watchedIndustry === 'Other' && (
              <motion.div key="other-industry" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <FieldLabel required>Other Industry</FieldLabel>
                <input {...register('otherIndustry')} placeholder="Please specify your industry..." className={inputCls(errors.otherIndustry)} />
                <FieldError message={errors.otherIndustry?.message} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <FieldLabel required>Business Stage</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUSINESS_STAGES.map((stage) => (
                <Controller key={stage} name="businessStage" control={control} render={({ field }) => (
                  <button type="button" onClick={() => field.onChange(stage)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      field.value === stage
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    {stage}
                  </button>
                )} />
              ))}
            </div>
            <FieldError message={errors.businessStage?.message} />
          </div>
        </Card>

        {/* Section 2: Location */}
        <Card className="border-slate-200/90 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-blue-600" /> Business Location / Market
          </h3>
          <p className="text-xs text-slate-500 -mt-1">Where will your business operate?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Country</FieldLabel>
              <input {...register('country')} placeholder="e.g. India, United States, UAE..." className={inputCls(errors.country)} />
              <FieldError message={errors.country?.message} />
            </div>
            <div>
              <FieldLabel>Region / State <span className="text-slate-400 font-normal">(optional)</span></FieldLabel>
              <input {...register('region')} placeholder="e.g. Kerala, California..." className={inputCls(errors.region)} />
            </div>
          </div>
        </Card>

        {/* Section 3: Business Idea */}
        <Card className="border-slate-200/90 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lightbulb className="w-4 h-4 text-blue-600" /> Business Idea
          </h3>

          <div>
            <FieldLabel required>What does your business do?</FieldLabel>
            <textarea {...register('businessDescription')} rows={4}
              placeholder="Describe your business idea, product, or service in a few sentences..."
              className={inputCls(errors.businessDescription)} />
            <div className="flex items-start justify-between mt-1">
              <FieldError message={errors.businessDescription?.message} />
              <span className="text-[10px] text-slate-400 ml-auto">Explain what you plan to offer and how your business will work.</span>
            </div>
          </div>

          <div>
            <FieldLabel required>What problem are you trying to solve?</FieldLabel>
            <textarea {...register('problemStatement')} rows={3}
              placeholder="Describe the problem or need your business is addressing..."
              className={inputCls(errors.problemStatement)} />
            <FieldError message={errors.problemStatement?.message} />
          </div>
        </Card>

        {/* Section 4: Business Goals */}
        <Card className="border-slate-200/90 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-4 h-4 text-blue-600" /> Business Goals
          </h3>
          <FieldLabel required>What is your main business goal?</FieldLabel>

          <Controller name="businessGoals" control={control} render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BUSINESS_GOAL_OPTIONS.map((goal) => {
                const selected = field.value?.includes(goal);
                return (
                  <button key={goal} type="button"
                    onClick={() => field.onChange(selected ? field.value.filter((g) => g !== goal) : [...(field.value || []), goal])}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? 'bg-white border-white' : 'border-slate-300'}`}>
                      {selected && <Check className="w-2.5 h-2.5 text-blue-600" />}
                    </div>
                    {goal}
                  </button>
                );
              })}
            </div>
          )} />
          <FieldError message={errors.businessGoals?.message} />

          <AnimatePresence>
            {watchedGoals?.includes('Other') && (
              <motion.div key="other-goal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <FieldLabel required>Other Goal</FieldLabel>
                <input {...register('otherGoal')} placeholder="Please describe your other business goal..." className={inputCls(errors.otherGoal)} />
                <FieldError message={errors.otherGoal?.message} />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Section 5: Website */}
        <Card className="border-slate-200/90 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-blue-600" />
            Existing Website <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </h3>
          <div>
            <FieldLabel>Existing Website</FieldLabel>
            <div className="relative flex items-center">
              <Globe className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input {...register('website')} placeholder="https://example.com" className={`${inputCls(errors.website)} pl-10`} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Optional. Provide your existing website if your business is already online.</p>
          </div>
        </Card>

        {/* Section 6: Social links (conditional) */}
        <AnimatePresence>
          {showExistingSection && (
            <motion.div key="existing-section" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 space-y-4">
              <div className="pb-3 border-b border-blue-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-blue-600" /> Current Business Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">All fields in this section are optional.</p>
              </div>
              <div className="space-y-3">
                {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <input {...register(`socialMediaLinks.${key}`)} placeholder={placeholder} className={inputCls(errors.socialMediaLinks?.[key])} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-20 shrink-0">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <div />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            icon={ChevronRight}
            iconPosition="right"
            className="shadow-lg shadow-blue-500/25"
          >
            {profileExists ? 'Update Business Profile' : 'Continue to BrandDNA'}
          </Button>
        </div>
      </form>

    </div>
  );
};
