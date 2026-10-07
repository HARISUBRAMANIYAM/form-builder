import React, { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import FieldCard from './FieldCard';
import { SectionCard } from './SectionCard';
// import { Button } from 'react-bootstrap';
import { useShallow } from 'zustand/shallow';

const DROPPABLE_ID = 'form-canvas';

const FormCanvas: React.FC = () => {
  const {
    fields,
    pages,
    sections,
    activePageId,
    selectedFieldId,
    setActivePage,
    addPage,
    removePage,
    updatePage,
    addSection,
  } = useFormBuilderStore(
    useShallow((s) => ({
      fields: s.formDefinition.fields,
      pages: s.formDefinition.pages ?? [{ id: 'page-1', title: 'Page 1', displayOrder: 0 }],
      sections: s.formDefinition.sections ?? [],
      activePageId: s.activePageId || 'page-1',
      selectedFieldId: s.selectedFieldId,
      setActivePage: s.setActivePage,
      addPage: s.addPage,
      removePage: s.removePage,
      updatePage: s.updatePage,
      addSection: s.addSection,
    }))
  );

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageTitleInput, setPageTitleInput] = useState<string>('');

  const { isOver, setNodeRef } = useDroppable({ id: DROPPABLE_ID });

  // Filter fields belonging to the active page
  const pageFields = fields.filter((f) => !f.pageId || f.pageId === activePageId);

  // Get sections belonging to active page
  const activePageSections = sections.filter((sec) => sec.pageId === activePageId);

  // Un-sectioned fields in active page
  const unsectionedFields = pageFields.filter((f) => !f.sectionId);

  const handlePageTitleSave = (pageId: string) => {
    setEditingPageId(null);
    if (pageTitleInput.trim()) {
      updatePage(pageId, { title: pageTitleInput.trim() });
    }
  };

  const startEditPageTitle = (pageId: string, currentTitle: string) => {
    setEditingPageId(pageId);
    setPageTitleInput(currentTitle);
  };

  return (
    <main className="fb-canvas">
      {/* ── Top Page Bar / Stepper Navigation Tabs ── */}
      <div className="fb-page-bar">
        <div className="d-flex align-items-center gap-2 overflow-auto" style={{ maxWidth: '80%' }}>
          {pages.map((p, index) => {
            const isActive = p.id === activePageId;
            const isEditing = editingPageId === p.id;

            return (
              <div
                key={p.id}
                className={`fb-page-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActivePage(p.id)}
              >
                <i className="pi pi-file" style={{ fontSize: '11px' }} />
                {isEditing ? (
                  <input
                    type="text"
                    className="fb-page-tab__edit-input"
                    value={pageTitleInput}
                    onChange={(e) => setPageTitleInput(e.target.value)}
                    onBlur={() => handlePageTitleSave(p.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePageTitleSave(p.id)}
                    autoFocus
                    style={{ width: '100px' }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEditPageTitle(p.id, p.title)}
                    title="Double-click to edit page title"
                  >
                    Step {index + 1}: {p.title}
                  </span>
                )}

                {pages.length > 1 && isActive && (
                  <i
                    className="pi pi-times ms-1"
                    style={{ fontSize: '10px', opacity: 0.8 }}
                    title="Delete Page"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePage(p.id);
                    }}
                  />
                )}
              </div>
            );
          })}

          <button
            type="button"
            className="fb-action-btn fb-action-btn-secondary py-1 px-2 text-xs"
            onClick={addPage}
            title="Add new Page / Step"
          >
            <i className="pi pi-plus" style={{ fontSize: '10px' }} /> Add Step
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="fb-action-btn fb-action-btn-primary py-1 px-2 text-xs"
            onClick={() => addSection(activePageId)}
            title="Add Collapsible Section Container to Active Page"
          >
            <i className="pi pi-folder-plus" style={{ fontSize: '12px' }} /> Add Section
          </button>
        </div>
      </div>

      {/* Canvas Header */}
      <div
        style={{
          padding: '8px 24px',
          borderBottom: '1px solid var(--fb-border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--fb-surface)',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--fb-text-secondary)' }}>
          <i className="pi pi-bars me-2" style={{ color: 'var(--fb-primary)' }} />
          Active Step Canvas ({pages.find((p) => p.id === activePageId)?.title})
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--fb-text-muted)' }}>
          {pageFields.length} {pageFields.length === 1 ? 'field' : 'fields'} on this step
        </span>
      </div>

      <div className="fb-canvas__body">
        {pageFields.length === 0 && activePageSections.length === 0 ? (
          <div
            ref={setNodeRef}
            className={`fb-canvas__empty ${isOver ? 'drag-over' : ''}`}
          >
            <div className="fb-canvas__empty-icon">
              <i className="pi pi-plus-circle" />
            </div>
            <div className="fb-canvas__empty-title">
              {isOver ? 'Release to add field' : 'Drag fields here for this Step'}
            </div>
            <div className="fb-canvas__empty-sub">
              Pick a field type from the left panel and drag it here,
              <br />
              or click "Add Section" above to group fields in containers.
            </div>
          </div>
        ) : (
          <div
            ref={setNodeRef}
            className={`fb-canvas__drop-zone ${isOver ? 'drag-over' : ''}`}
          >
            {/* 1. Render Sections for Active Page */}
            {activePageSections.map((sec) => {
              const secFields = fields.filter((f) => f.sectionId === sec.id);
              return (
                <SectionCard
                  key={sec.id}
                  section={sec}
                  fields={secFields}
                  selectedFieldId={selectedFieldId}
                />
              );
            })}

            {/* 2. Render Un-sectioned Fields for Active Page */}
            {unsectionedFields.length > 0 && (
              <SortableContext
                items={unsectionedFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="row g-2 w-100 m-0">
                  {unsectionedFields.map((field) => (
                    <div className={`col-md-${field.columnSpan || 12}`} key={field.id}>
                      <FieldCard
                        field={field}
                        isSelected={field.id === selectedFieldId}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Bottom drop target hint */}
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

