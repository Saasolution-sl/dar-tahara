"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { assessmentCopy } from "@/i18n/assessment-copy";
import { calculateAssessmentQuote, formatMoneyFromCents, type BillingInterval, type PropertyCondition, type TimeSlot } from "@/lib/assessment";
import type { FrequencyKey } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type EnquiryPayload = {
  mode: "book" | "quote"; sizeM2: number; frequencyKey: FrequencyKey; frequencyLabel: string;
  visitsPerMonth: number; pricePerVisit: number | null; discountPercentage: number; monthlyTotal: number | null;
  effectivePricePerVisit: number | null; isCustom: boolean; perCleaning: boolean; materialsIncluded: boolean; overMax: boolean;
};

type FormState = {
  preferredDate: string; alternateDate: string; timeSlot: TimeSlot; addressLine1: string; addressLine2: string; city: string; postalCode: string; countryCode: string;
  sizeM2: string; bedrooms: string; bathrooms: string; pets: boolean; petDetails: string; smoking: boolean; condition: PropertyCondition; accessNotes: string;
  fullName: string; email: string; phone: string; billingInterval: BillingInterval; propertyAccuracyAccepted: boolean; termsAccepted: boolean;
};

const initial: FormState = { preferredDate:"", alternateDate:"", timeSlot:"flexible", addressLine1:"", addressLine2:"", city:"", postalCode:"", countryCode:"MA", sizeM2:"68", bedrooms:"2", bathrooms:"1", pets:false, petDetails:"", smoking:false, condition:"standard", accessNotes:"", fullName:"", email:"", phone:"", billingInterval:"monthly", propertyAccuracyAccepted:false, termsAccepted:false };

export function EnquiryModal({ open, onClose, payload, dict: _dict, locale }: { open: boolean; onClose: () => void; payload: EnquiryPayload | null; dict: Dictionary; locale: Locale }) {
  const c = assessmentCopy[locale];
  const subtitle = locale === "en"
    ? "Your first visit allows us to professionally assess your home, perform an initial deep clean where required and prepare your personalised cleaning plan."
    : c.subtitle;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormState>(initial);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const titleId = React.useId();
  const minDate = new Date().toISOString().slice(0, 10);

  React.useEffect(() => { if (open && payload) { setStep(0); setError(""); setForm({ ...initial, sizeM2: String(payload.sizeM2) }); } }, [open, payload]);
  React.useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); before?.focus?.(); };
  }, [open, onClose]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((old) => ({ ...old, [key]: value })); setError(""); }
  function validCurrent() {
    if (step === 0 && !form.preferredDate) return false;
    if (step === 1 && (!form.addressLine1.trim() || !form.city.trim() || Number(form.sizeM2) < 20 || !form.countryCode.trim() || (form.pets && !form.petDetails.trim()))) return false;
    if (step === 2 && (!form.fullName.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.phone.trim())) return false;
    if (step === 3 && (!form.propertyAccuracyAccepted || !form.termsAccepted)) return false;
    return true;
  }
  function advance() { if (!validCurrent()) { setError(c.required); return; } setStep((value) => Math.min(3, value + 1)); }

  const quote = payload ? calculateAssessmentQuote(Number(form.sizeM2) || payload.sizeM2, payload.frequencyKey, payload.overMax) : null;
  async function checkout() {
    if (!payload || !validCurrent()) { setError(c.required); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/assessment/checkout", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ ...form, sizeM2:Number(form.sizeM2), overMax:payload.overMax, frequency:payload.frequencyKey, locale, addressLine2:form.addressLine2 || null, postalCode:form.postalCode || null, alternateDate:form.alternateDate || null, petDetails:form.petDetails || null, accessNotes:form.accessNotes || null }) });
      const data = await res.json() as { checkoutUrl?: string };
      if (!res.ok || !data.checkoutUrl) throw new Error("checkout");
      window.location.assign(data.checkoutUrl);
    } catch { setError(c.failed); setLoading(false); }
  }

  return <AnimatePresence>{open && payload ? (
    <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
      <button className="absolute inset-0 cursor-default bg-charcoal/65 backdrop-blur-md" onClick={onClose} aria-label={c.close}/>
      <motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{opacity:0,y:30,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:30}} className="relative z-10 flex max-h-[96dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-border bg-card shadow-lift outline-none sm:rounded-[2rem]">
        <header className="border-b border-border px-5 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[.22em] text-accent">Dar Tahara</p><h2 id={titleId} className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">{c.title}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div><button onClick={onClose} aria-label={c.close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border hover:bg-secondary"><X className="h-4 w-4"/></button></div>
          <ol className="mt-5 grid grid-cols-4 gap-2">{c.steps.map((name,index)=><li key={name} className={cn("border-t-2 pt-2 text-[.65rem] font-semibold uppercase tracking-wider",index<=step?"border-accent text-foreground":"border-border text-muted-foreground")}><span className="hidden sm:inline">{index+1}. </span>{name}</li>)}</ol>
        </header>
        <div className="overflow-y-auto px-5 py-6 sm:px-8">
          {step===0 && <Step title={c.appointment}><div className="grid gap-4 sm:grid-cols-2"><Field label={c.preferredDate} required><input type="date" min={minDate} value={form.preferredDate} onChange={e=>update("preferredDate",e.target.value)} className="input"/></Field><Field label={c.alternateDate}><input type="date" min={minDate} value={form.alternateDate} onChange={e=>update("alternateDate",e.target.value)} className="input"/></Field></div><Choice label={c.time} values={[["morning",c.morning],["afternoon",c.afternoon],["flexible",c.flexible]]} selected={form.timeSlot} onChange={v=>update("timeSlot",v as TimeSlot)}/></Step>}
          {step===1 && <Step title={c.home}><div className="grid gap-4 sm:grid-cols-2"><Field label={c.address} required wide><input value={form.addressLine1} onChange={e=>update("addressLine1",e.target.value)} autoComplete="street-address" className="input"/></Field><Field label={c.address2} wide><input value={form.addressLine2} onChange={e=>update("addressLine2",e.target.value)} className="input"/></Field><Field label={c.city} required><input value={form.city} onChange={e=>update("city",e.target.value)} autoComplete="address-level2" className="input"/></Field><Field label={c.postcode}><input value={form.postalCode} onChange={e=>update("postalCode",e.target.value)} autoComplete="postal-code" className="input"/></Field><Field label={c.country} required><input maxLength={2} value={form.countryCode} onChange={e=>update("countryCode",e.target.value.toUpperCase())} className="input"/></Field><Field label={c.size} required><input type="number" min="20" max={payload.overMax?5000:250} value={form.sizeM2} onChange={e=>update("sizeM2",e.target.value)} className="input"/></Field><Field label={c.bedrooms} required><input type="number" min="0" max="50" value={form.bedrooms} onChange={e=>update("bedrooms",e.target.value)} className="input"/></Field><Field label={c.bathrooms} required><input type="number" min="0" max="50" value={form.bathrooms} onChange={e=>update("bathrooms",e.target.value)} className="input"/></Field></div><BooleanChoice label={c.pets} value={form.pets} set={v=>update("pets",v)} copy={c}/>{form.pets&&<Field label={c.petDetails} required><input value={form.petDetails} onChange={e=>update("petDetails",e.target.value)} className="input"/></Field>}<BooleanChoice label={c.smoking} value={form.smoking} set={v=>update("smoking",v)} copy={c}/><Choice label={c.condition} values={[["excellent",c.excellent],["standard",c.standard],["needs_attention",c.needsAttention],["heavy",c.heavy]]} selected={form.condition} onChange={v=>update("condition",v as PropertyCondition)}/><Field label={c.notes}><textarea rows={3} value={form.accessNotes} onChange={e=>update("accessNotes",e.target.value)} className="input h-auto py-3"/></Field></Step>}
          {step===2 && <Step title={c.you}><div className="grid gap-4 sm:grid-cols-2"><Field label={c.name} required><input value={form.fullName} onChange={e=>update("fullName",e.target.value)} autoComplete="name" className="input"/></Field><Field label={c.email} required><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} autoComplete="email" className="input"/></Field><Field label={c.phone} required><input type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)} autoComplete="tel" className="input"/></Field></div><Choice label={c.billing} values={[["monthly",c.monthly],["annual",`${c.annual} · ${c.save}`]]} selected={form.billingInterval} onChange={v=>update("billingInterval",v as BillingInterval)}/></Step>}
          {step===3 && quote && <Step title={c.review}><div className="rounded-2xl border border-border bg-secondary/40 p-5"><Summary label={c.plan} value={`${payload.frequencyLabel} · ${form.sizeM2} m²`}/>{quote.estimatedMonthlyCents!==null&&<Summary label={c.monthlyEstimate} value={formatMoneyFromCents(quote.estimatedMonthlyCents,locale)}/>} {form.billingInterval==="annual"&&quote.estimatedAnnualCents!==null&&<Summary label={c.annualTotal} value={`${formatMoneyFromCents(quote.estimatedAnnualCents,locale)} · ${c.save}`}/>}<div className="my-4 border-t border-border"/><Summary label={c.assessmentFee} value={formatMoneyFromCents(quote.assessmentPriceCents,locale)}/><Summary strong label={c.dueToday} value={formatMoneyFromCents(quote.assessmentPriceCents,locale)}/></div><CheckField checked={form.propertyAccuracyAccepted} set={v=>update("propertyAccuracyAccepted",v)}>{c.propertyAccuracy}</CheckField><CheckField checked={form.termsAccepted} set={v=>update("termsAccepted",v)}>{c.acceptTerms} <a className="underline" href={`/${locale}/terms`} target="_blank">{c.terms}</a> · <a className="underline" href={`/${locale}/privacy`} target="_blank">{c.privacy}</a></CheckField><p className="flex gap-2 rounded-xl bg-primary/[.06] p-4 text-xs leading-relaxed text-muted-foreground"><LockKeyhole className="h-4 w-4 shrink-0 text-primary"/>{c.secure}</p></Step>}
          {error&&<p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-5 py-4 sm:px-8"><button type="button" onClick={()=>step===0?onClose():setStep(s=>s-1)} className={buttonVariants({variant:"outline",size:"lg"})}><ArrowLeft className="h-4 w-4"/>{step===0?c.close:c.back}</button>{step<3?<button type="button" onClick={advance} className={buttonVariants({variant:"primary",size:"lg"})}>{c.next}<ArrowRight className="h-4 w-4"/></button>:<button type="button" disabled={loading} onClick={checkout} className={cn(buttonVariants({variant:"gold",size:"lg"}),"min-w-52")}><CreditCard className="h-4 w-4"/>{loading?c.processing:c.pay}</button>}</footer>
      </motion.div>
    </motion.div>
  ):null}</AnimatePresence>;
}

function Step({title,children}:{title:string;children:React.ReactNode}) { return <section className="space-y-5"><h3 className="font-serif text-xl text-foreground">{title}</h3>{children}</section>; }
function Field({label,required,wide,children}:{label:string;required?:boolean;wide?:boolean;children:React.ReactNode}) { return <label className={cn("block",wide&&"sm:col-span-2")}><span className="mb-1.5 block text-sm font-medium text-foreground">{label}{required&&<span className="text-accent"> *</span>}</span>{children}</label>; }
function Choice({label,values,selected,onChange}:{label:string;values:string[][];selected:string;onChange:(v:string)=>void}) { return <fieldset><legend className="mb-2 text-sm font-medium text-foreground">{label}</legend><div className="flex flex-wrap gap-2">{values.map(([v,n])=><label key={v} className={cn("cursor-pointer rounded-full border px-4 py-2 text-sm",selected===v?"border-primary bg-primary text-primary-foreground":"border-border hover:bg-secondary")}><input className="sr-only" type="radio" checked={selected===v} onChange={()=>onChange(v)}/>{n}</label>)}</div></fieldset>; }
function BooleanChoice({label,value,set,copy}:{label:string;value:boolean;set:(v:boolean)=>void;copy:{yes:string;no:string}}) { return <Choice label={label} values={[["yes",copy.yes],["no",copy.no]]} selected={value?"yes":"no"} onChange={v=>set(v==="yes")}/>; }
function Summary({label,value,strong}:{label:string;value:string;strong?:boolean}) { return <div className={cn("flex justify-between gap-5 py-1 text-sm",strong&&"font-semibold text-foreground")}><span className={strong?"":"text-muted-foreground"}>{label}</span><span className="text-end">{value}</span></div>; }
function CheckField({checked,set,children}:{checked:boolean;set:(v:boolean)=>void;children:React.ReactNode}) { return <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-muted-foreground"><span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",checked?"border-primary bg-primary text-primary-foreground":"border-border")}><input type="checkbox" className="sr-only" checked={checked} onChange={e=>set(e.target.checked)}/>{checked&&<Check className="h-3 w-3"/>}</span><span>{children}</span></label>; }
