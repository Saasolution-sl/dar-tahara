"use client";

import { useEffect, useState } from "react";
import { FEEDBACK_REASONS, isFeedbackReason, type FeedbackReason } from "@/lib/early-access/funnel";

const LABELS: Record<FeedbackReason, string> = {
  just_looking: "I was only exploring",
  too_long: "The signup felt too long",
  price_unclear: "Pricing was not clear",
  not_ready: "I am not ready yet",
  address_difficult: "Entering the address was difficult",
  technical_problem: "Something did not work",
  unclear: "A question or step was unclear",
  privacy_concern: "I had a privacy concern",
  service_unavailable: "The service did not fit my location or needs",
  changed_mind: "I changed my mind",
  other: "Another reason",
};

export function AbandonmentFeedback({ token: suppliedToken, initialReason }: {
  token?: string;
  initialReason?: string;
}) {
  const [reason, setReason] = useState<FeedbackReason | "">(
    isFeedbackReason(initialReason) ? initialReason : "",
  );
  const [comments, setComments] = useState("");
  const [token, setToken] = useState(suppliedToken || "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "opted_out" | "error">("idle");

  useEffect(() => {
    if (token) return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const candidate = hash.get("token");
    if (!candidate) return;
    const suggestedReason = hash.get("reason");
    if (!reason && isFeedbackReason(suggestedReason)) setReason(suggestedReason);
    setToken(candidate);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [reason, token]);

  async function send(payload: Record<string, unknown>) {
    setState("saving");
    try {
      const response = await fetch("/api/early-access/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload }),
      });
      if (!response.ok) throw new Error("request_failed");
      setState(payload.optOut ? "opted_out" : "saved");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return <p className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">Thank you. Your answer has been recorded.</p>;
  }
  if (state === "opted_out") {
    return <p className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">You will not receive another signup reminder.</p>;
  }
  if (!token) return <p>This feedback link is invalid or incomplete.</p>;
  return <div className="space-y-6">
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold">What stopped you from continuing?</legend>
      {FEEDBACK_REASONS.map((value) => <label key={value} className="flex cursor-pointer gap-3 rounded-xl border border-border p-3">
        <input type="radio" name="reason" value={value} checked={reason === value} onChange={() => setReason(value)} />
        <span>{LABELS[value]}</span>
      </label>)}
    </fieldset>
    <label className="block space-y-2">
      <span className="font-medium">Anything else? (optional)</span>
      <textarea className="min-h-28 w-full rounded-xl border border-border bg-background p-3" maxLength={2000} value={comments} onChange={(event) => setComments(event.target.value)} />
    </label>
    {state === "error" && <p className="text-sm text-destructive">We could not save that. Please try again.</p>}
    <div className="flex flex-wrap gap-3">
      <button className="rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50" disabled={!reason || state === "saving"} onClick={() => send({ reason, comments })}>
        {state === "saving" ? "Saving…" : "Send feedback"}
      </button>
      <button className="rounded-full border border-border px-5 py-3 text-sm" disabled={state === "saving"} onClick={() => send({ optOut: true })}>
        Do not send another reminder
      </button>
    </div>
  </div>;
}
