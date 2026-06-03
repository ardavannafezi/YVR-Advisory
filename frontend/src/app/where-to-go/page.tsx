import type { Metadata } from "next";
import { WhereToGoClient } from "@/components/tonight/WhereToGoClient";

export const metadata: Metadata = {
  title: "Where to Go Tonight — Vancouver Nightlife | YVR Advisory",
  description: "Answer a few questions and we'll point you to the best events in Vancouver tonight.",
  alternates: { canonical: "/where-to-go" },
};

export default function WhereToGoPage() {
  return <WhereToGoClient />;
}
