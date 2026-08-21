"use client";

import * as React from "react";
import type { PortalCopy } from "@/i18n/portal-copy";
import { buttonVariants } from "@/components/ui/button";

const ROOM_TYPES = [
  "living_room", "master_bedroom", "bedroom_2", "bedroom_3", "guest_room",
  "kitchen", "office", "hallway", "dining_room", "other",
] as const;

export function AddAcUnitModal({
  propertyId, copy,
}: {
  propertyId: string;
  copy: PortalCopy["acMaintenance"];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonVariants({ variant: "outline", size: "sm" })}>
        {copy.addUnit}
      </button>
      {open ? <AcUnitModal propertyId={propertyId} copy={copy} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function AcUnitModal({
  propertyId, copy, onClose,
}: {
  propertyId: string;
  copy: PortalCopy["acMaintenance"];
  onClose: () => void;
}) {
  const [roomType, setRoomType] = React.useState<(typeof ROOM_TYPES)[number] | "">("");
  const [roomLabel, setRoomLabel] = React.useState("");
  const [floor, setFloor] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [serialNumber, setSerialNumber] = React.useState("");
  const [locationNotes, setLocationNotes] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/account/ac-units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId, roomType, roomLabel: roomLabel || undefined,
        floor: floor || undefined, brand: brand || undefined, model: model || undefined,
        serialNumber: serialNumber || undefined, locationNotes: locationNotes || undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setError(copy.errors[data.error || ""] || copy.errors.bad_request);
      setStatus("idle");
      return;
    }
    setStatus("done");
    setTimeout(() => location.reload(), 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={copy.modalTitle}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">{copy.modalTitle}</h2>
          <button onClick={onClose} aria-label={copy.cancel} className="text-muted-foreground hover:text-foreground">×</button>
        </div>
        {status === "done" ? (
          <p className="mt-6 text-sm">{copy.success}</p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm">
              {copy.roomLabel}
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as (typeof ROOM_TYPES)[number])}
                required
                className="input mt-2"
              >
                <option value="" disabled>{copy.roomLabel}</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>{copy.roomTypes[type]}</option>
                ))}
              </select>
            </label>
            {roomType === "other" ? (
              <label className="block text-sm">
                {copy.roomLabelOther}
                <input type="text" value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} required maxLength={200} className="input mt-2" />
              </label>
            ) : (
              <label className="block text-sm">
                {copy.roomLabel} ({copy.notesLabel.replace(" (optional)", "").toLowerCase()})
                <input type="text" value={roomLabel} onChange={(e) => setRoomLabel(e.target.value)} maxLength={200} className="input mt-2" placeholder={roomType ? copy.roomTypes[roomType] : ""} />
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                {copy.floorLabel}
                <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} maxLength={50} className="input mt-2" />
              </label>
              <label className="block text-sm">
                {copy.brandLabel}
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={100} className="input mt-2" />
              </label>
              <label className="block text-sm">
                {copy.modelLabel}
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} maxLength={100} className="input mt-2" />
              </label>
              <label className="block text-sm">
                {copy.serialLabel}
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} maxLength={100} className="input mt-2" />
              </label>
            </div>
            <label className="block text-sm">
              {copy.notesLabel}
              <textarea value={locationNotes} onChange={(e) => setLocationNotes(e.target.value)} maxLength={500} className="input mt-2" rows={2} />
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className={buttonVariants({ variant: "outline", size: "md" })}>{copy.cancel}</button>
              <button type="submit" disabled={status === "submitting" || !roomType} className={buttonVariants({ variant: "primary", size: "md" })}>
                {status === "submitting" ? copy.submitting : copy.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
