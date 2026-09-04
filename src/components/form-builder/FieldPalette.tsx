import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FieldType } from '../../types/formBuilder.types';
import { PHASE1_CATEGORIES, PHASE1_FIELDS } from '../../constants/fieldTypeRegistry';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';

// ─── Draggable Palette Item ──────────────────────────────────────────

interface PaletteItemProps {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, label, icon, description }) => {
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
    >
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
        {PHASE1_CATEGORIES.map((category) => {
          const fields = PHASE1_FIELDS.filter((f) => f.category === category);
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
