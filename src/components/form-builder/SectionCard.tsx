import React, { useState } from 'react';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';
import FieldCard from './FieldCard';
// import { Button } from 'react-bootstrap';
import { useShallow } from 'zustand/shallow';
import type { FormField, FormSection } from '../../types/formBuilder.types';

interface SectionCardProps {
  section: FormSection;
  fields: FormField[];
  selectedFieldId: string | null;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  fields,
  selectedFieldId,
}) => {
  const { updateSection, removeSection } = useFormBuilderStore(
    useShallow((s) => ({
      updateSection: s.updateSection,
      removeSection: s.removeSection,
    }))
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(section.title);
  const [isCollapsed, setIsCollapsed] = useState(section.defaultCollapsed ?? false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      updateSection(section.id, { title: titleValue.trim() });
    } else {
      setTitleValue(section.title);
    }
  };

  return (
    <div className="fb-section-card">
      {/* Section Header */}
      <div className="fb-section-card__header">
        <div className="d-flex align-items-center gap-2">
          {section.isCollapsible && (
            <button
              type="button"
              className="fb-icon-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
            >
              <i className={`pi ${isCollapsed ? 'pi-chevron-right' : 'pi-chevron-down'}`} />
            </button>
          )}

          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'var(--fb-primary-ghost)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fb-primary)',
              fontSize: 12,
            }}
          >
            <i className="pi pi-folder" />
          </div>

          {isEditingTitle ? (
            <input
              type="text"
              className="fb-section-card__title-input"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              style={{ width: '220px' }}
            />
          ) : (
            <span
              className="fb-section-card__title"
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit section title"
              style={{ cursor: 'pointer' }}
            >
              {section.title}
              <i className="pi pi-pencil text-muted" style={{ fontSize: '11px' }} />
            </span>
          )}

          <span
            className="fb-badge"
            style={{
              background: 'var(--fb-surface-2)',
              color: 'var(--fb-text-muted)',
              marginLeft: 8,
            }}
          >
            {fields.length} {fields.length === 1 ? 'field' : 'fields'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="fb-icon-btn danger"
            onClick={() => removeSection(section.id)}
            title="Delete Section"
          >
            <i className="pi pi-trash" />
          </button>
        </div>
      </div>

      {/* Section Sub-description */}
      {section.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--fb-text-muted)', marginBottom: 12 }}>
          {section.description}
        </p>
      )}

      {/* Section Fields Container */}
      {!isCollapsed && (
        <div className="fb-section-card__body">
          {fields.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '16px',
                border: '1.5px dashed var(--fb-border)',
                borderRadius: 'var(--fb-radius-md)',
                color: 'var(--fb-text-muted)',
                fontSize: '0.8rem',
                background: 'var(--fb-bg)',
              }}
            >
              <i className="pi pi-inbox me-1" />
              No fields in this section yet. Add fields from the left palette!
            </div>
          ) : (
            <div className="row g-2">
              {fields.map((field) => (
                <div className={`col-md-${field.columnSpan || 12}`} key={field.id}>
                  <FieldCard
                    field={field}
                    isSelected={selectedFieldId === field.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
