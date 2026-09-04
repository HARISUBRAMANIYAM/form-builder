import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Toast } from 'primereact/toast';

import { FIELD_TYPE_MAP } from '../../constants/fieldTypeRegistry';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';

import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import PropertiesPanel from './PropertiesPanel';
import FormRenderer from '../form-renderer/FormRenderer';

import './FormBuilder.css';
import type { FieldType, BuilderView } from '../../types/formBuilder.types';
import { useShallow } from 'zustand/shallow';

// ─── JSON View ───────────────────────────────────────────────────────

const JsonView: React.FC = () => {
  const json = useFormBuilderStore((s) => s.getFormDefinitionJson());

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-definition.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fb-json-view">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--fb-text-primary)' }}>Form Definition JSON</h5>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--fb-text-muted)' }}>
            The raw metadata schema that drives this form
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fb-action-btn fb-action-btn-secondary" onClick={handleCopy}>
            <i className="pi pi-copy" /> Copy
          </button>
          <button className="fb-action-btn fb-action-btn-primary" onClick={handleDownload}>
            <i className="pi pi-download" /> Download
          </button>
        </div>
      </div>
      {/* <pre>{json}</pre> */}
    </div>
  );
};

// ─── Drag Overlay Preview ────────────────────────────────────────────

const DragPreview: React.FC<{ fieldType: FieldType }> = ({ fieldType }) => {
  const entry = FIELD_TYPE_MAP.get(fieldType);
  return (
    <div
      style={{
        background: 'var(--fb-surface)',
        border: '2px solid var(--fb-primary)',
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--fb-shadow-lg)',
        cursor: 'grabbing',
        width: 240,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: 'var(--fb-primary-ghost)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fb-primary)', fontSize: 14,
      }}>
        <i className={entry?.icon ?? 'pi pi-plus'} />
      </div>
      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--fb-text-primary)' }}>
        {entry?.label ?? fieldType}
      </span>
    </div>
  );
};

// ─── Main Builder Page ───────────────────────────────────────────────

const FormBuilderPage: React.FC = () => {
  const toast = React.useRef<Toast>(null);
  const [activeView, setActiveView] = useState<BuilderView>('builder');
  const [draggedPaletteType, setDraggedPaletteType] = useState<FieldType | null>(null);

const {
  formDefinition,
  setFormName,
  // setFormDescription,
  addField,
  reorderFields,
  resetForm,
  getFormDefinitionJson,
} = useFormBuilderStore(
  useShallow((s) => ({
    formDefinition: s.formDefinition,
    setFormName: s.setFormName,
    setFormDescription: s.setFormDescription,
    addField: s.addField,
    reorderFields: s.reorderFields,
    resetForm: s.resetForm,
    getFormDefinitionJson: s.getFormDefinitionJson,
  }))
);

  // ── DnD Sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.source === 'palette') {
      setDraggedPaletteType(data.current.fieldType as FieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedPaletteType(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;

    // Palette → Canvas drop
    if (activeData?.source === 'palette') {
      addField(activeData.fieldType as FieldType);
      return;
    }

    // Canvas reorder
    if (activeData?.source !== 'palette' && active.id !== over.id) {
      const fields = formDefinition.fields;
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderFields(oldIndex, newIndex);
      }
    }
  };

  const handleExportJson = () => {
    const json = getFormDefinitionJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formDefinition.formName.replace(/\s+/g, '_')}_form.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.current?.show({ severity: 'success', summary: 'Exported', detail: 'Form JSON downloaded.', life: 2000 });
  };

  const handleReset = () => {
    if (window.confirm('Reset the form? All fields will be cleared.')) {
      resetForm();
    }
  };

  const fieldIds = formDefinition.fields.map((f) => f.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toast ref={toast} />

      {/* ── Top Navbar ── */}
      <header className="fb-navbar">
        <div className="fb-navbar__brand">
          <div className="fb-navbar__brand-icon">
            <i className="pi pi-objects-column" />
          </div>
          <span className="fb-navbar__title">Form Builder</span>
        </div>

        {/* Editable form name */}
        <div className="fb-navbar__form-name">
          <input
            type="text"
            value={formDefinition.formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Untitled Form"
            title="Click to rename form"
          />
        </div>

        {/* View Tabs */}
        <div className="fb-view-tabs">
          {(['builder', 'preview', 'json'] as BuilderView[]).map((view) => {
            const icons: Record<BuilderView, string> = {
              builder: 'pi pi-pencil',
              preview: 'pi pi-eye',
              json: 'pi pi-code',
            };
            const labels: Record<BuilderView, string> = {
              builder: 'Builder',
              preview: 'Preview',
              json: 'JSON',
            };
            return (
              <button
                key={view}
                className={`fb-view-tab ${activeView === view ? 'active' : ''}`}
                onClick={() => setActiveView(view)}
              >
                <i className={icons[view]} />
                {labels[view]}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="fb-navbar__actions">
          <span style={{ fontSize: '0.75rem', color: 'var(--fb-text-muted)' }}>
            {formDefinition.fields.length} fields
          </span>
          <button className="fb-action-btn fb-action-btn-secondary" onClick={handleReset}>
            <i className="pi pi-refresh" /> Reset
          </button>
          <button className="fb-action-btn fb-action-btn-primary" onClick={handleExportJson}>
            <i className="pi pi-download" /> Export
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      {activeView === 'builder' && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="fb-layout">
            <FieldPalette />

            {/* Canvas with SortableContext for reordering */}
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              <FormCanvas />
            </SortableContext>

            <PropertiesPanel />
          </div>

          {/* Drag overlay while dragging from palette */}
          <DragOverlay>
            {draggedPaletteType && <DragPreview fieldType={draggedPaletteType} />}
          </DragOverlay>
        </DndContext>
      )}

      {activeView === 'preview' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <FormRenderer formDefinition={formDefinition} />
        </div>
      )}

      {activeView === 'json' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <JsonView />
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
