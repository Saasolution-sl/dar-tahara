"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

type Copy = {
  loading: string;
  protected: string;
  protectedBody: string;
  enrollTitle: string;
  enrollBody: string;
  start: string;
  secret: string;
  code: string;
  verify: string;
  verifying: string;
  error: string;
};

type Enrollment = { factorId: string; qrCode: string; secret: string };

export function MfaSecurityPanel({ next, copy }: { next: string; copy: Copy }) {
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [verifiedFactorId, setVerifiedFactorId] = React.useState<string | null>(null);
  const [isAal2, setIsAal2] = React.useState(false);
  const [enrollment, setEnrollment] = React.useState<Enrollment | null>(null);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const [factorResult, assuranceResult] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      if (!active) return;
      if (factorResult.error || assuranceResult.error) {
        setError(true);
      } else {
        setVerifiedFactorId(factorResult.data.totp[0]?.id || null);
        setIsAal2(assuranceResult.data.currentLevel === "aal2");
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  async function startEnrollment() {
    setBusy(true);
    setError(false);
    try {
      const supabase = createClient();
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      for (const factor of factors.data.all.filter((item) => item.status === "unverified")) {
        const result = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (result.error) throw result.error;
      }
      const result = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Dar Tahara authenticator",
        issuer: "Dar Tahara",
      });
      if (result.error || result.data.type !== "totp") throw result.error || new Error("totp_enrollment_failed");
      setEnrollment({
        factorId: result.data.id,
        qrCode: result.data.totp.qr_code,
        secret: result.data.totp.secret,
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const factorId = enrollment?.factorId || verifiedFactorId;
    if (!factorId || !/^\d{6}$/.test(code)) {
      setError(true);
      return;
    }
    setBusy(true);
    setError(false);
    try {
      const result = await createClient().auth.mfa.challengeAndVerify({ factorId, code });
      if (result.error) throw result.error;
      location.assign(next);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">{copy.loading}</p>;
  if (isAal2) return <div className="rounded-xl bg-primary/10 p-4"><p className="font-semibold text-primary">{copy.protected}</p><p className="mt-2 text-sm text-muted-foreground">{copy.protectedBody}</p></div>;

  const qrSource = enrollment?.qrCode.startsWith("data:")
    ? enrollment.qrCode
    : enrollment
      ? `data:image/svg+xml;utf-8,${encodeURIComponent(enrollment.qrCode)}`
      : null;

  return <div>
    <h2 className="font-serif text-2xl">{copy.enrollTitle}</h2>
    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.enrollBody}</p>
    {!verifiedFactorId && !enrollment ? <button type="button" disabled={busy} onClick={startEnrollment} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{copy.start}</button> : null}
    {enrollment && qrSource ? <div className="mt-5 grid gap-5 sm:grid-cols-[200px_1fr] sm:items-center">
      {/* Supabase returns this SVG specifically for the authenticated user's pending factor. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrSource} width={200} height={200} alt="TOTP enrollment QR code" className="rounded-xl border border-border bg-white p-3" />
      <div><p className="text-sm font-medium">{copy.secret}</p><code className="mt-2 block break-all rounded-lg bg-secondary p-3 text-sm">{enrollment.secret}</code></div>
    </div> : null}
    {verifiedFactorId || enrollment ? <form onSubmit={verify} className="mt-5 max-w-sm space-y-3">
      <label className="block text-sm font-medium">{copy.code}<input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required className="input mt-2" /></label>
      {error ? <p role="alert" className="text-sm text-red-600">{copy.error}</p> : null}
      <button disabled={busy || code.length !== 6} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? copy.verifying : copy.verify}</button>
    </form> : error ? <p role="alert" className="mt-4 text-sm text-red-600">{copy.error}</p> : null}
  </div>;
}
