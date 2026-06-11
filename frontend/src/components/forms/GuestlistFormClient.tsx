"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { setTrackedEmail } from "@/lib/analytics";
import { GoldButton } from "@/components/ui/GoldButton";
import { FormField } from "@/components/forms/FormField";
import { goldDivider } from "@/styles/animations";

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MUSIC_OPTIONS = ["house", "techno", "hip-hop", "r&b", "top 40", "latin", "afrobeats", "dancehall", "reggaeton", "edm", "live"];

const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  music_type: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function GuestlistForm() {
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [partySize, setPartySize] = useState<number | undefined>(undefined);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.post("/api/guestlist", {
        ...data,
        party_size: partySize,
        event_id: params.get("event_id") ? parseInt(params.get("event_id")!) : undefined,
        venue_id: params.get("venue_id") ? parseInt(params.get("venue_id")!) : undefined,
        source_page: "/guestlist",
      });
      setTrackedEmail(data.email);
      setSubmitted(true);
    } catch (e: any) {
      setServerError(e.message || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 border border-gold/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-gold text-2xl">✓</span>
          </div>
          <h2 className="font-serif text-3xl text-text-primary mb-3">Request Received</h2>
          <p className="text-text-muted mb-4">We&apos;ll review your request and send a confirmation to your email. If you don&apos;t see it, please check your spam or junk folder.</p>
          <p className="text-text-dim text-xs">Questions? Email us at <span className="text-gold">info@yvradvisory.ca</span></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-xl mx-auto px-6">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">Exclusive Access</p>
        <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-2">Join the Guestlist</h1>
        <motion.div variants={goldDivider} initial="hidden" animate="visible" className="h-px w-16 bg-gold mb-6 origin-left" />
        <p className="text-text-muted mb-10 leading-relaxed">
          Get priority access to Vancouver&apos;s best events. Submit your request and we&apos;ll confirm via email.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField label="Full Name" placeholder="Your full name" error={errors.full_name?.message} {...register("full_name")} />
          <FormField label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} {...register("email")} />

          <div>
            <p className="text-[10px] uppercase tracking-widest text-text-dim mb-2">Party Size (optional)</p>
            <div className="flex flex-wrap gap-2">
              {PARTY_SIZES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPartySize(partySize === n ? undefined : n)}
                  className={`w-10 h-10 text-sm border transition-all duration-150 ${partySize === n ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-muted hover:border-gold/40 hover:text-gold"}`}
                >
                  {n === 10 ? "10+" : n}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Preferred Music (optional)" as="select" {...register("music_type")}>
            <option value="">Select...</option>
            {MUSIC_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </FormField>

          {serverError && (
            <div className="border border-red-500/40 p-3 text-sm text-red-400">{serverError}</div>
          )}

          <p className="text-[10px] text-text-dim leading-relaxed">
            Your information may be used by YVR Advisory for personalized marketing and event recommendations.
          </p>

          <GoldButton type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Submitting..." : "Join the Guestlist"}
          </GoldButton>
        </form>
      </div>
    </div>
  );
}

export function GuestlistFormClient() {
  return (
    <Suspense>
      <GuestlistForm />
    </Suspense>
  );
}
