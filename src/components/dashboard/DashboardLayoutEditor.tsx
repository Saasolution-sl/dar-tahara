"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { KeyboardSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { buttonVariants } from "@/components/ui/button";
import type { UserWidgetPreference } from "@/lib/dashboard/widgets";
import type { DashboardCopy } from "@/i18n/dashboard-copy";
import { cn } from "@/lib/utils";

type EditorItem = { id: string; title: string; visible: boolean };

function SortableRow({ item, onToggle, copy }: { item: EditorItem; onToggle: (id: string) => void; copy: DashboardCopy["customize"] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none text-muted-foreground" aria-label={copy.dragHandle}>
        ⠿
      </button>
      <span className="flex-1 text-sm">{item.title}</span>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={item.visible} onChange={() => onToggle(item.id)} className="h-4 w-4 rounded border-border" />
        {copy.visible}
      </label>
    </li>
  );
}

export function DashboardLayoutEditor({
  widgets,
  initialLayout,
  copy,
}: {
  widgets: Array<{ id: string; title: string }>;
  initialLayout: UserWidgetPreference[];
  copy: DashboardCopy["customize"];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const initialOrder = React.useMemo<EditorItem[]>(() => {
    const byId = new Map(widgets.map((w) => [w.id, w]));
    const ordered: EditorItem[] = [];
    for (const pref of initialLayout) {
      const widget = byId.get(pref.id);
      if (widget) {
        ordered.push({ id: widget.id, title: widget.title, visible: pref.visible });
        byId.delete(pref.id);
      }
    }
    for (const widget of byId.values()) ordered.push({ id: widget.id, title: widget.title, visible: true });
    return ordered;
  }, [widgets, initialLayout]);

  const [items, setItems] = React.useState<EditorItem[]>(initialOrder);
  React.useEffect(() => setItems(initialOrder), [initialOrder]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  function toggle(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/dashboard/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets: items.map((item) => ({ id: item.id, visible: item.visible })) }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        {copy.button}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 p-4" role="dialog" aria-modal>
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-serif text-lg">{copy.modalTitle}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">{copy.close}</button>
            </div>
            <p className="px-4 pt-3 text-xs text-muted-foreground">{copy.helpText}</p>
            <div className="flex-1 overflow-y-auto p-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <SortableRow key={item.id} item={item} onToggle={toggle} copy={copy} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
            <div className="border-t border-border p-4">
              <button type="button" disabled={saving} onClick={() => void save()} className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}>
                {saving ? copy.saving : copy.save}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
