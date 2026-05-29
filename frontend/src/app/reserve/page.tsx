"use client";

import { useState } from "react";
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

const schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  party_size: z.string().min(1, "Please select party size"),
  date_requested: z.string().optional(),
  occasion: z.string().optional(),
  preferences: z.string().optional(),
  budget_range: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ReservePage() {
  const params = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.post("/api/reservations", {
        ...data,
        party_size: parseInt(data.party_size),
        venue_id: params.get("venue_id") ? parseInt(params.get("venue_id")!) : undefined,
        event_id: params.get("event_id") ? parseInt(params.get("event_id")!) : undefined,
        date_requested: data.date_requested || undefined,
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
          <p className="text-text-muted">Our team will confirm your table reservation within 24 hours. Check your email for updates.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-xl mx-auto px-6">
        <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4">VIP Experience</p>
        <h1 className="font-serif text-4xl md:text-5xl text-text-primary mb-2">Reserve a Table</h1>
        <motion.div variants={goldDivider} initial="hidden" animate="visible" className="h-px w-16 bg-gold mb-6 origin-left" />
        <p className="text-text-muted mb-10 leading-relaxed">
          Secure your table at Vancouver&apos;s best venues. We&apos;ll handle the details — you enjoy the night.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <FormField label="Full Name" placeholder="Your full name" error={errors.full_name?.message} {...register("full_name")} />
          <FormField label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} {...register("email")} />
          <FormField label="Phone Number (optional)" type="tel" placeholder="+1 (604) 000-0000" error={errors.phone?.message} {...register("phone")} />

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Party Size" as="select" error={errors.party_size?.message} {...register("party_size")}>
              <option value="">Select...</option>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </FormField>
            <FormField label="Date (optional)" type="date" error={errors.date_requested?.message} {...register("date_requested")} />
          </div>

          <FormField label="Occasion (optional)" placeholder="Birthday, anniversary, corporate..." error={errors.occasion?.message} {...register("occasion")} />

          <FormField label="Budget Per Person (optional)" as="select" error={errors.budget_range?.message} {...register("budget_range")}>
            <option value="">Select...</option>
            {["Under $30", "$30–$60", "$60–$100", "$100+"].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </FormField>

          <FormField
            label="Special Preferences (optional)"
            as="textarea"
            placeholder="Seating preferences, dietary needs, special requests..."
            error={errors.preferences?.message}
            {...register("preferences")}
          />

          {serverError && (
            <div className="border border-red-500/40 p-3 text-sm text-red-400">{serverError}</div>
          )}

          <GoldButton type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Submitting..." : "Request Reservation"}
          </GoldButton>
        </form>
      </div>
    </div>
  );
}
