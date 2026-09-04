import React from 'react';
import { Form } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import type { ChoiceOption } from '../../../types/formBuilder.types';

const ChoiceFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const options: ChoiceOption[] = values.config?.options ?? [];
  const isMultiple = values.fieldType === 'MULTIPLE_CHOICE';

  const updateOption = (index: number, field: 'label' | 'value', val: string) => {
    const updated = options.map((opt, i) =>
      i === index
        ? {
            ...opt,
            [field]: val,
            // Auto-sync value from label if value hasn't been manually changed
            ...(field === 'label' ? { value: val.toLowerCase().replace(/\s+/g, '_') } : {}),
          }
        : opt
    );
    setFieldValue('config.options', updated);
  };

  const addOption = () => {
    const newOpt: ChoiceOption = { label: `Option ${options.length + 1}`, value: `option_${uuidv4().slice(0, 6)}` };
    setFieldValue('config.options', [...options, newOpt]);
  };

  const removeOption = (index: number) => {
    setFieldValue('config.options', options.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fb-properties__section-title">
        <i className="pi pi-list" /> Options
      </div>
      <div className="fb-options-list">
        {options.map((opt, i) => (
          <div key={i} className="fb-option-row">
            <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)', width: 20, textAlign: 'center' }}>
              {i + 1}.
            </span>
            <input
              type="text"
              placeholder={`Option ${i + 1} label`}
              value={opt.label}
              onChange={(e) => updateOption(i, 'label', e.target.value)}
            />
            <button
              type="button"
              className="fb-icon-btn danger"
              title="Remove"
              onClick={() => removeOption(i)}
              disabled={options.length <= 1}
              style={{ flexShrink: 0 }}
            >
              <i className="pi pi-times" style={{ fontSize: '11px' }} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fb-add-option-btn" onClick={addOption}>
        <i className="pi pi-plus" style={{ fontSize: '11px' }} />
        Add Option
      </button>

      {isMultiple && (
        <>
          <div className="fb-divider" />
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Group controlId="config.minSelect" style={{ flex: 1 }}>
              <Form.Label>Min Selections</Form.Label>
              <Form.Control
                type="number"
                size="sm"
                value={values.config?.minSelect ?? ''}
                placeholder="e.g. 1"
                onChange={(e) => setFieldValue('config.minSelect', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Form.Group>
            <Form.Group controlId="config.maxSelect" style={{ flex: 1 }}>
              <Form.Label>Max Selections</Form.Label>
              <Form.Control
                type="number"
                size="sm"
                value={values.config?.maxSelect ?? ''}
                placeholder="e.g. 3"
                onChange={(e) => setFieldValue('config.maxSelect', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Form.Group>
          </div>
        </>
      )}

      <div className="fb-divider" />
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Layout</div>
          <div className="fb-toggle-desc">Horizontal or vertical arrangement</div>
        </div>
        <Form.Select
          size="sm"
          style={{ width: 'auto' }}
          value={values.config?.layout ?? 'vertical'}
          onChange={(e) => setFieldValue('config.layout', e.target.value)}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </Form.Select>
      </div>
    </>
  );
};

export default ChoiceFieldConfig;
