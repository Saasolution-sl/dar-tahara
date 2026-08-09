"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Attribution } from "@/lib/early-access/attribution";
import {
  SESSION_STORAGE_KEY,
  isOpaqueToken,
  isSessionId,
  type FunnelEventInput,
  type SessionCredentials,
} from "@/lib/early-access/funnel";
import { STEPS, type EarlyAccessPayload, type FieldErrors, type StepId } from "@/lib/early-access/schema";

type Restore = {
  partialPayload: Partial<EarlyAccessPayload>;
  currentStepIndex: number;
};

type BootstrapResponse = Restore & {
  ok?: boolean;
  credentials?: SessionCredentials;
  restored?: boolean;
  clientRevision?: number;
};

const ID_TO_FIELD: Record<string, keyof EarlyAccessPayload> = {
  firstName: "firstName", lastName: "lastName", email: "email",
  cc: "phoneCountry", mobileNumber: "mobileNumber", whatsappNumber: "whatsappNumber",
  pcm: "preferredContactMethod", lang: "preferredLanguage", residenceCity: "residenceCity",
  baddrSearch: "billingAddressLine1", "baddr-search": "billingAddressLine1",
  b2: "billingAddressLine2", bhn: "billingBuildingNumber", bpc: "billingPostalCode",
  bcity: "billingCity", breg: "billingRegion", bco: "billingCountry", tax: "taxId",
  invoiceEmail: "invoiceEmail", "inv-same": "invoiceEmailSameAsContact",
  pname: "propertyName", "paddr-search": "propertyAddressLine1", pa2: "propertyAddressLine2",
  pbn: "propertyBuildingNumber", ppc: "propertyPostalCode", pcity: "propertyCity",
  preg: "propertyRegion", gm: "googleMapsUrl", en: "entryNotes", auth: "authorizedBySubmitter",
  size: "sizeM2", bed: "bedrooms", bath: "bathrooms", kit: "kitchens", liv: "livingRooms",
  nf: "numberOfFloors", elev: "elevatorStatus", out: "outdoorArea", occ: "occupancyType",
  cond: "propertyCondition", furn: "furnishingStatus", pets: "petsPresent", smoke: "smokingStatus",
  freq: "desiredFrequency", start: "expectedStartPeriod", date: "preferredStartDate",
  sn: "serviceNotes", an: "accessNotes", "c-acc": "confirmAccurate",
  "c-auth": "confirmAuthorized", "c-priv": "acceptPrivacy", "c-op": "acceptOperationalComms",
  "c-mkt": "marketingConsent", "ea-reminder-consent": "abandonedReminderConsent",
};

const NAME_TO_FIELD: Record<string, keyof EarlyAccessPayload> = {
  pcm: "preferredContactMethod", brt: "billingRecipientType", pt: "propertyType",
  am: "accessMethod", sli: "smartLockInterest",
};

function storedCredentials(): SessionCredentials | undefined {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "null") as unknown;
    if (!raw || typeof raw !== "object") return undefined;
    const candidate = raw as Record<string, unknown>;
    return isSessionId(candidate.id) && isOpaqueToken(candidate.token)
      ? { id: candidate.id, token: candidate.token }
      : undefined;
  } catch {
    return undefined;
  }
}

function safeField(target: EventTarget | null): keyof EarlyAccessPayload | undefined {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) {
    return undefined;
  }
  return ID_TO_FIELD[target.id] ?? NAME_TO_FIELD[target.name];
}

function hasValue(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement && (target.type === "checkbox" || target.type === "radio")) {
    return target.checked;
  }
  return target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement
    ? target.value.trim().length > 0
    : false;
}

function attributionFromUrl(): Attribution {
  const params = new URLSearchParams(window.location.search);
  return {
    sourceCode: params.get("src") ?? undefined,
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
  };
}

export function useSignupFunnel(params: {
  locale: Locale;
  payload: EarlyAccessPayload;
  stepIndex: number;
  onRestore: (restore: Restore) => void;
}) {
  const [credentials, setCredentials] = React.useState<SessionCredentials | null>(null);
  const payloadRef = React.useRef(params.payload);
  const stepIndexRef = React.useRef(params.stepIndex);
  const highestCompletedRef = React.useRef(-1);
  const startedRef = React.useRef(false);
  const initializedRef = React.useRef(false);
  const stepEnteredAtRef = React.useRef(Date.now());
  const attemptStartedAtRef = React.useRef(Date.now());
  const focusedRef = React.useRef(new Set<string>());
  const completedFieldRef = React.useRef(new Set<string>());
  const clientRevisionRef = React.useRef(0);

  payloadRef.current = params.payload;
  stepIndexRef.current = params.stepIndex;

  const postUpdate = React.useCallback(async (
    creds: SessionCredentials,
    event?: FunnelEventInput,
    overrides: Record<string, unknown> = {},
  ) => {
    const clientRevision = ++clientRevisionRef.current;
    try {
      await fetch("/api/early-access/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: creds,
          partialPayload: payloadRef.current,
          currentStep: STEPS[stepIndexRef.current],
          currentStepIndex: stepIndexRef.current,
          highestCompletedStep: highestCompletedRef.current,
          clientRevision,
          event,
          ...overrides,
        }),
        keepalive: true,
      });
    } catch {
      // Telemetry and autosave are always fail-open.
    }
  }, []);

  React.useEffect(() => {
    let alive = true;
    async function bootstrap() {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const resumeToken = hashParams.get("resume")
        ?? new URLSearchParams(window.location.search).get("resume");
      let data: BootstrapResponse | null = null;
      try {
        if (resumeToken && isOpaqueToken(resumeToken)) {
          const response = await fetch("/api/early-access/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: resumeToken }),
          });
          data = await response.json() as BootstrapResponse;
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("resume");
          cleanUrl.hash = "";
          window.history.replaceState(null, "", cleanUrl.pathname + cleanUrl.search);
        } else {
          const response = await fetch("/api/early-access/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              credentials: storedCredentials(),
              attribution: attributionFromUrl(),
              referrer: document.referrer,
              locale: params.locale,
            }),
          });
          data = await response.json() as BootstrapResponse;
        }
      } catch {
        return;
      }
      if (!alive || !data?.ok || !data.credentials) return;
      setCredentials(data.credentials);
      clientRevisionRef.current = Number.isSafeInteger(data.clientRevision)
        ? Math.max(0, Number(data.clientRevision)) : 0;
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.credentials));
      if (data.restored) {
        highestCompletedRef.current = Math.max(-1, Number(data.currentStepIndex) - 1);
        params.onRestore({
          partialPayload: data.partialPayload ?? {},
          currentStepIndex: Math.max(0, Math.min(STEPS.length - 1, Number(data.currentStepIndex) || 0)),
        });
      }
      initializedRef.current = true;
      attemptStartedAtRef.current = Date.now();
      stepEnteredAtRef.current = Date.now();
    }
    void bootstrap();
    return () => { alive = false; };
    // Bootstrap exactly once; onRestore is intentionally read from the initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced backend autosave. No form values enter browser storage.
  React.useEffect(() => {
    if (!credentials || !initializedRef.current) return;
    const timer = window.setTimeout(() => { void postUpdate(credentials); }, 800);
    return () => window.clearTimeout(timer);
  }, [credentials, params.payload, postUpdate]);

  React.useEffect(() => {
    if (!credentials || !initializedRef.current) return;
    stepEnteredAtRef.current = Date.now();
    void postUpdate(credentials, {
      eventName: "early_access_step_viewed",
      stepId: STEPS[params.stepIndex],
      stepIndex: params.stepIndex,
    });
  }, [credentials, params.stepIndex, postUpdate]);

  const markStarted = React.useCallback(() => {
    if (!credentials || startedRef.current) return;
    startedRef.current = true;
    void postUpdate(credentials, {
      eventName: "early_access_started",
      idempotencyKey: "session:started",
      stepId: STEPS[stepIndexRef.current],
      stepIndex: stepIndexRef.current,
    });
  }, [credentials, postUpdate]);

  const onFocusCapture = React.useCallback((event: React.FocusEvent) => {
    const field = safeField(event.target);
    if (!field || !credentials || focusedRef.current.has(field)) return;
    markStarted();
    focusedRef.current.add(field);
    void postUpdate(credentials, {
      eventName: "early_access_field_focused",
      idempotencyKey: `field-focused:${field}`,
      stepId: STEPS[stepIndexRef.current],
      stepIndex: stepIndexRef.current,
      fieldName: field,
    });
  }, [credentials, markStarted, postUpdate]);

  const onBlurCapture = React.useCallback((event: React.FocusEvent) => {
    const field = safeField(event.target);
    if (!field || !credentials || completedFieldRef.current.has(field) || !hasValue(event.target)) return;
    completedFieldRef.current.add(field);
    void postUpdate(credentials, {
      eventName: "early_access_field_completed",
      idempotencyKey: `field-completed:${field}`,
      stepId: STEPS[stepIndexRef.current],
      stepIndex: stepIndexRef.current,
      fieldName: field,
    });
  }, [credentials, postUpdate]);

  const stepCompleted = React.useCallback((step: StepId, stepIndex: number) => {
    if (!credentials) return;
    highestCompletedRef.current = Math.max(highestCompletedRef.current, stepIndex);
    void postUpdate(credentials, {
      eventName: "early_access_step_completed",
      idempotencyKey: `step-completed:${step}`,
      stepId: step,
      stepIndex,
      durationMs: Date.now() - stepEnteredAtRef.current,
      totalDurationMs: Date.now() - attemptStartedAtRef.current,
    }, { highestCompletedStep: highestCompletedRef.current });
  }, [credentials, postUpdate]);

  const validationErrors = React.useCallback((step: StepId, stepIndex: number, errors: FieldErrors) => {
    if (!credentials) return;
    for (const [fieldName, errorCode] of Object.entries(errors)) {
      void postUpdate(credentials, {
        eventName: "early_access_validation_error",
        stepId: step,
        stepIndex,
        fieldName,
        errorType: "client_validation",
        errorCode,
        durationMs: Date.now() - stepEnteredAtRef.current,
      });
    }
  }, [credentials, postUpdate]);

  const apiError = React.useCallback((errorCode: string, httpStatus?: number) => {
    if (!credentials) return;
    void postUpdate(credentials, {
      eventName: "early_access_api_error",
      stepId: STEPS[stepIndexRef.current],
      stepIndex: stepIndexRef.current,
      errorType: httpStatus && httpStatus >= 500 ? "server" : httpStatus ? "api" : "network",
      errorCode,
      totalDurationMs: Date.now() - attemptStartedAtRef.current,
      metadata: { ...(httpStatus ? { http_status: httpStatus } : {}) },
    });
  }, [credentials, postUpdate]);

  const clear = React.useCallback(() => {
    try { window.sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* storage blocked */ }
    setCredentials(null);
  }, []);

  return {
    credentials,
    markStarted,
    onFocusCapture,
    onBlurCapture,
    stepCompleted,
    validationErrors,
    apiError,
    clear,
  };
}
