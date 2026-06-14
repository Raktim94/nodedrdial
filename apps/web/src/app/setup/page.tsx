'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { setupApi } from '@/lib/api';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Phone, Building, User, Key } from 'lucide-react';

const steps = ['Admin Account', 'Organization', 'Twilio Setup', 'Review'];

const schema = z.object({
  adminFirstName: z.string().min(1),
  adminLastName: z.string().min(1),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  orgName: z.string().min(1),
  twilioAccountSid: z.string().optional(),
  twilioAuthToken: z.string().optional(),
  twilioApiKey: z.string().optional(),
  twilioApiSecret: z.string().optional(),
  twimlAppSid: z.string().optional(),
});

type SetupForm = z.infer<typeof schema>;

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm<SetupForm>({
    resolver: zodResolver(schema),
  });

  const stepFields: (keyof SetupForm)[][] = [
    ['adminFirstName', 'adminLastName', 'adminEmail', 'adminPassword'],
    ['orgName'],
    ['twilioAccountSid', 'twilioAuthToken'],
    [],
  ];

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (data: SetupForm) => {
    setLoading(true);
    try {
      await setupApi.run(data);
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Setup Complete!</h2>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Phone className="w-4 h-4" />
            TwilioHub OSS
          </div>
          <h1 className="text-3xl font-bold text-foreground">Initial Setup</h1>
          <p className="text-muted-foreground mt-2">Configure your platform in {steps.length} steps</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-success' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            {step === 0 && <><User className="w-5 h-5 text-primary" /> Admin Account</>}
            {step === 1 && <><Building className="w-5 h-5 text-primary" /> Organization Details</>}
            {step === 2 && <><Key className="w-5 h-5 text-primary" /> Twilio Integration</>}
            {step === 3 && <><CheckCircle2 className="w-5 h-5 text-primary" /> Review & Complete</>}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.adminFirstName?.message} {...register('adminFirstName')} placeholder="John" />
                  <Field label="Last Name" error={errors.adminLastName?.message} {...register('adminLastName')} placeholder="Doe" />
                </div>
                <Field label="Email Address" type="email" error={errors.adminEmail?.message} {...register('adminEmail')} placeholder="admin@example.com" />
                <Field label="Password" type="password" error={errors.adminPassword?.message} {...register('adminPassword')} placeholder="Min. 8 characters" />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Field label="Organization Name" error={errors.orgName?.message} {...register('orgName')} placeholder="Acme Corp" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your Twilio account. You can skip this and configure it later in Settings.
                </p>
                <Field label="Account SID" {...register('twilioAccountSid')} placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                <Field label="Auth Token" type="password" {...register('twilioAuthToken')} placeholder="Your Twilio auth token" />
                <Field label="API Key (for browser calling)" {...register('twilioApiKey')} placeholder="SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                <Field label="API Secret" type="password" {...register('twilioApiSecret')} placeholder="API key secret" />
                <Field label="TwiML App SID (for browser calling)" {...register('twimlAppSid')} placeholder="APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <ReviewRow label="Admin Email" value={getValues('adminEmail')} />
                <ReviewRow label="Organization" value={getValues('orgName')} />
                <ReviewRow label="Twilio Connected" value={getValues('twilioAccountSid') ? 'Yes' : 'Skip (configure later)'} />
              </div>
            )}
          </form>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2.5 bg-muted border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
