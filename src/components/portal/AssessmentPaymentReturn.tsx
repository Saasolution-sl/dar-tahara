"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";

const copy: Record<Locale, { confirming: string; paid: string }> = {
  en: {
    confirming: "Payment received. We are confirming it securely before showing the new property.",
    paid: "Assessment paid. Your new property is now pending assessment.",
  },
  nl: {
    confirming: "Betaling ontvangen. We bevestigen deze veilig voordat de nieuwe woning wordt getoond.",
    paid: "Beoordeling betaald. Uw nieuwe woning wacht nu op de beoordeling.",
  },
  fr: {
    confirming: "Paiement reçu. Nous le confirmons avant d’afficher le nouveau bien.",
    paid: "Évaluation payée. Votre nouveau bien est en attente d’évaluation.",
  },
  ar: {
    confirming: "تم استلام الدفع. نؤكده بأمان قبل عرض العقار الجديد.",
    paid: "تم دفع رسوم التقييم. العقار الجديد الآن بانتظار التقييم.",
  },
  es: {
    confirming: "Pago recibido. Lo estamos confirmando antes de mostrar la nueva propiedad.",
    paid: "Evaluación pagada. Su nueva propiedad está pendiente de evaluación.",
  },
  de: {
    confirming: "Zahlung erhalten. Wir bestätigen sie, bevor die neue Immobilie angezeigt wird.",
    paid: "Bewertung bezahlt. Ihre neue Immobilie wartet nun auf die Bewertung.",
  },
  pt: {
    confirming: "Pagamento recebido. Estamos a confirmá-lo antes de mostrar a nova propriedade.",
    paid: "Avaliação paga. A nova propriedade aguarda agora a avaliação.",
  },
};

export function AssessmentPaymentReturn({ sessionId, locale }: { sessionId: string; locale: Locale }) {
  const router = useRouter();
  const [paid, setPaid] = React.useState(false);

  React.useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      const response = await fetch(
        `/api/assessment/status?session_id=${encodeURIComponent(sessionId)}`,
        { cache: "no-store" },
      );
      const result = response.ok
        ? ((await response.json()) as { payment_status?: string })
        : null;
      if (!active) return;
      if (result?.payment_status === "paid") {
        setPaid(true);
        router.refresh();
        return;
      }
      attempt += 1;
      if (attempt < 12) timer = setTimeout(check, 1500);
    };
    void check();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [router, sessionId]);

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm shadow-soft" role="status">
      {paid ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      ) : (
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
      )}
      <p>{paid ? copy[locale].paid : copy[locale].confirming}</p>
    </div>
  );
}
