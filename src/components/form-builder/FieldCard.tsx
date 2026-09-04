import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FIELD_TYPE_MAP } from '../../constants/fieldTypeRegistry';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import type { FormField } from '../../types/formBuilder.types';
import { useShallow } from 'zustand/shallow';

interface FieldCardProps {
  field: FormField;
  isSelected: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, isSelected }) => {
  const { selectField, removeField, duplicateField } = useFormBuilderStore(useShallow((s) => ({
    selectField: s.selectField,
    removeField: s.removeField,
    duplicateField: s.duplicateField,
  })));

  const registryEntry = FIELD_TYPE_MAP.get(field.fieldType);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeField(field.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateField(field.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`fb-field-card ${isSelected ? 'selected' : ''}`}
      onClick={() => selectField(field.id)}
    >
      {/* Drag Handle */}
      <div
        className="fb-field-card__drag-handle"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <i className="pi pi-bars" />
      </div>

      {/* Field Icon */}
      <div className="fb-field-card__icon">
        <i className={registryEntry?.icon ?? 'pi pi-question-circle'} />
      </div>

      {/* Field Info */}
      <div className="fb-field-card__content">
        <div className="fb-field-card__name">{field.fieldName || '(Untitled)'}</div>
        <div className="fb-field-card__meta">
          <span className="fb-field-card__code">{field.fieldCode}</span>
          <span className="fb-badge fb-badge-type">{registryEntry?.label ?? field.fieldType}</span>
          {field.isMandatory && (
            <span className="fb-badge fb-badge-required">
              <i className="pi pi-asterisk" style={{ fontSize: '7px' }} /> Required
            </span>
          )}
          {field.formulaConfig?.isCalculated && (
            <span className="fb-badge bg-warning text-dark font-monospace" style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
              <i className="pi pi-calculator me-1" style={{ fontSize: '9px' }} /> Formula
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="fb-field-card__actions">
        <button
          className="fb-icon-btn"
          title="Duplicate field"
          onClick={handleDuplicate}
        >
          <i className="pi pi-copy" />
        </button>
        <button
          className="fb-icon-btn danger"
          title="Delete field"
          onClick={handleDelete}
        >
          <i className="pi pi-trash" />
        </button>
      </div>
    </div>
  );
};

export default FieldCard;
