import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChoiceOption } from '../../types/formBuilder.types';

interface RankOrderRendererProps {
  options: ChoiceOption[];
  value: ChoiceOption[];
  onChange: (ranked: ChoiceOption[]) => void;
  disabled?: boolean;
}

// ── Sortable Item ────────────────────────────────────────────

const RankItem: React.FC<{ opt: ChoiceOption; rank: number; disabled?: boolean }> = ({
  opt, rank, disabled,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opt.value });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: isDragging ? 'var(--fb-primary-ghost)' : 'var(--fb-surface)',
        border: `1.5px solid ${isDragging ? 'var(--fb-primary)' : 'var(--fb-border)'}`,
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'grab',
        userSelect: 'none',
        marginBottom: 6,
        boxShadow: isDragging ? 'var(--fb-shadow-md)' : 'var(--fb-shadow-xs)',
      }}
      {...(disabled ? {} : { ...attributes, ...listeners })}
    >
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        background: 'var(--fb-primary)',
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
      }}>
        {rank}
      </span>
      <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--fb-text-primary)', fontWeight: 500 }}>
        {opt.label}
      </span>
      {!disabled && <i className="pi pi-bars" style={{ color: 'var(--fb-text-muted)', fontSize: 13 }} />}
    </div>
  );
};

// ── Rank Order Renderer ──────────────────────────────────────

const RankOrderRenderer: React.FC<RankOrderRendererProps> = ({
  options, value, onChange, disabled,
}) => {
  const [ranked, setRanked] = useState<ChoiceOption[]>(value?.length ? value : [...options]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ranked.findIndex((o) => o.value === active.id);
    const newIdx = ranked.findIndex((o) => o.value === over.id);
    const next = arrayMove(ranked, oldIdx, newIdx);
    setRanked(next);
    onChange(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ranked.map((o) => o.value)} strategy={verticalListSortingStrategy}>
        {ranked.map((opt, i) => (
          <RankItem key={opt.value} opt={opt} rank={i + 1} disabled={disabled} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default RankOrderRenderer;
