"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { setTrackedEmail } from "@/lib/analytics";
import { GoldButton } from "@/components/ui/GoldButton";
import { FormField } from "@/components/forms/FormField";
import { useState } from "react";

const guestlistSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  party_size: z.string().optional(),
});

const reservationSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  party_size: z.string().min(1, "Select party size"),
  occasion: z.string().optional(),
  budget_range: z.string().optional(),
  preferences: z.string().optional(),
});

type GuestlistData = z.infer<typeof guestlistSchema>;
type ReservationData = z.infer<typeof reservationSchema>;

interface Props {
  mode: "guestlist" | "reservation";
  eventId?: number;
  venueId?: number;
  eventName?: string;
  venueName?: string;
  onClose: () => void;
}

function GuestlistForm({ eventId, venueId, onDone }: { eventId?: number; venueId?: number; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GuestlistData>({
    resolver: zodResolver(guestlistSchema),
  });

  async function onSubmit(data: GuestlistData) {
    setServerError(null);
    try {
      await api.post("/api/guestlist", {
        ...data,
        party_size: data.party_size ? parseInt(data.party_size) : undefined,
        event_id: eventId,
        venue_id: venueId,
        source_page: "event-modal",
      });
      setTrackedEmail(data.email);
      onDone();
    } catch (e: any) {
      setServerError(e.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Full Name" placeholder="Your full name" error={errors.full_name?.message} {...register("full_name")} />
      <FormField label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} {...register("email")} />
      <FormField label="Party Size (optional)" as="select" error={errors.party_size?.message} {...register("party_size")}>
        <option value="">Select...</option>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((n) => <option key={n} value={n}>{n}</option>)}
      </FormField>
      {serverError && <div className="border border-red-500/40 p-3 text-sm text-red-400">{serverError}</div>}
      <GoldButton type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Submitting…" : "Join Guestlist"}
      </GoldButton>
    </form>
  );
}

function ReservationForm({ eventId, venueId, onDone }: { eventId?: number; venueId?: number; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
  });

  async function onSubmit(data: ReservationData) {
    setServerError(null);
    try {
      await api.post("/api/reservations", {
        ...data,
        party_size: parseInt(data.party_size),
        event_id: eventId,
        venue_id: venueId,
      });
      setTrackedEmail(data.email);
      onDone();
    } catch (e: any) {
      setServerError(e.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormField label="Full Name" placeholder="Your full name" error={errors.full_name?.message} {...register("full_name")} />
      <FormField label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} {...register("email")} />
      <FormField label="Phone (optional)" type="tel" placeholder="+1 (604) 000-0000" {...register("phone")} />
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Party Size" as="select" error={errors.party_size?.message} {...register("party_size")}>
          <option value="">Select...</option>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((n) => <option key={n} value={n}>{n}</option>)}
        </FormField>
        <FormField label="Budget / Person (optional)" as="select" {...register("budget_range")}>
          <option value="">Select...</option>
          {["Under $30", "$30–$60", "$60–$100", "$100+"].map((b) => <option key={b} value={b}>{b}</option>)}
        </FormField>
      </div>
      <FormField label="Occasion (optional)" placeholder="Birthday, anniversary..." {...register("occasion")} />
      <FormField label="Special Requests (optional)" as="textarea" placeholder="Seating, dietary needs..." {...register("preferences")} />
      {serverError && <div className="border border-red-500/40 p-3 text-sm text-red-400">{serverError}</div>}
      <GoldButton type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Submitting…" : "Request Bottle Service"}
      </GoldButton>
    </form>
  );
}

export function EventFormModal({ mode, eventId, venueId, eventName, venueName, onClose }: Props) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const title = mode === "guestlist" ? "Join the Guestlist" : "Book Bottle Service";
  const subtitle = mode === "guestlist"
    ? `Guestlist entry in your name${eventName ? ` for ${eventName}` : ""}.`
    : `Our advisory team will confirm your table shortly${venueName ? ` at ${venueName}` : ""}.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full sm:max-w-lg bg-[#0f0f0f] border border-white/10 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-dim hover:text-text-primary transition-colors text-xl leading-none"
          >
            ×
          </button>

          {done ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
              <div className="w-12 h-12 border border-gold/40 flex items-center justify-center mx-auto mb-4">
                <span className="text-gold text-xl">✓</span>
              </div>
              {mode === "guestlist" ? (
                <>
                  <h3 className="font-serif text-2xl text-text-primary mb-2">You&apos;re on the List</h3>
                  <p className="text-text-muted text-sm">Your guestlist is confirmed. Show your name at the door.</p>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-2xl text-text-primary mb-2">Request Received</h3>
                  <p className="text-text-muted text-sm">Our advisory team will contact you shortly to confirm all details.</p>
                </>
              )}
              <button onClick={onClose} className="mt-6 text-xs uppercase tracking-widest text-text-dim hover:text-text-muted transition-colors">
                Close
              </button>
            </motion.div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
                {mode === "guestlist" ? "Exclusive Access" : "VIP Experience"}
              </p>
              <h2 className="font-serif text-2xl text-text-primary mb-1">{title}</h2>
              <p className="text-text-muted text-sm mb-6">{subtitle}</p>

              {mode === "guestlist" ? (
                <GuestlistForm eventId={eventId} venueId={venueId} onDone={() => setDone(true)} />
              ) : (
                <ReservationForm eventId={eventId} venueId={venueId} onDone={() => setDone(true)} />
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
