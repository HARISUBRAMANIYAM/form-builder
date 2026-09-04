import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FieldType } from '../../types/formBuilder.types';
import { ALL_PALETTE_FIELDS, PALETTE_CATEGORIES } from '../../constants/fieldTypeRegistry';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';

// ─── Draggable Palette Item ──────────────────────────────────────────

interface PaletteItemProps {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  isPhase2: boolean;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, label, icon, description, isPhase2 }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: 'palette', fieldType: type },
  });

  const addField = useFormBuilderStore((s) => s.addField);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`fb-palette__item ${isDragging ? 'dragging' : ''}`}
      onClick={() => addField(type)}
      title={description}
      style={{ position: 'relative' }}
    >
      {isPhase2 && (
        <span style={{
          position: 'absolute', top: 4, right: 4,
          background: 'var(--fb-primary)', color: 'white',
          fontSize: '0.5rem', fontWeight: 700, padding: '1px 4px',
          borderRadius: 99, letterSpacing: '0.04em',
          lineHeight: 1.4,
        }}>
          P2
        </span>
      )}
      <div className="fb-palette__item-icon">
        <i className={icon} />
      </div>
      <span className="fb-palette__item-label">{label}</span>
    </div>
  );
};

// ─── Palette Panel ───────────────────────────────────────────────────

const FieldPalette: React.FC = () => {
  return (
    <aside className="fb-palette">
      <div className="fb-panel-header">
        <h6>Field Types</h6>
      </div>
      <div className="fb-palette__scroll">
        {PALETTE_CATEGORIES.map((category) => {
          const fields = ALL_PALETTE_FIELDS.filter((f) => f.category === category);
          if (fields.length === 0) return null;
          return (
            <div key={category} className="fb-palette__category">
              <span className="fb-palette__category-label">{category}</span>
              <div className="fb-palette__grid">
                {fields.map((field) => (
                  <PaletteItem
                    key={field.type}
                    type={field.type}
                    label={field.label}
                    icon={field.icon}
                    description={field.description}
                    isPhase2={field.phase === 2}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default FieldPalette;
