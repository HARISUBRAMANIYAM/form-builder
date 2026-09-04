import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import FieldCard from './FieldCard';
import { useShallow } from 'zustand/shallow';

const DROPPABLE_ID = 'form-canvas';

const FormCanvas: React.FC = () => {
  const { fields, selectedFieldId } = useFormBuilderStore( useShallow((s) => ({
    fields: s.formDefinition.fields,
    selectedFieldId: s.selectedFieldId,
  })));

  const { isOver, setNodeRef } = useDroppable({ id: DROPPABLE_ID });

  const fieldIds = fields.map((f) => f.id);

  return (
    <main className="fb-canvas">
      {/* Canvas Header */}
      <div
        style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--fb-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--fb-surface)',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--fb-text-secondary)' }}>
          Form Canvas
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--fb-text-muted)' }}>
          {fields.length} {fields.length === 1 ? 'field' : 'fields'}
        </span>
      </div>

      <div className="fb-canvas__body">
        {fields.length === 0 ? (
          <div
            ref={setNodeRef}
            className={`fb-canvas__empty ${isOver ? 'drag-over' : ''}`}
          >
            <div className="fb-canvas__empty-icon">
              <i className="pi pi-plus-circle" />
            </div>
            <div className="fb-canvas__empty-title">
              {isOver ? 'Release to add field' : 'Drag fields here to start'}
            </div>
            <div className="fb-canvas__empty-sub">
              Pick a field type from the left panel and drag it here,
              <br />
              or simply click on a field type to add it.
            </div>
          </div>
        ) : (
          <div
            ref={setNodeRef}
            className={`fb-canvas__drop-zone ${isOver ? 'drag-over' : ''}`}
          >
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  isSelected={field.id === selectedFieldId}
                />
              ))}
            </SortableContext>

            {/* Bottom drop target hint when there are already fields */}
            {isOver && (
              <div
                style={{
                  height: 4,
                  background: 'var(--fb-primary)',
                  borderRadius: 99,
                  marginTop: 4,
                  opacity: 0.7,
                }}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default FormCanvas;
