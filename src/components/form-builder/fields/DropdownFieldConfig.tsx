import React from 'react';
import { Form } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import type { ChoiceOption } from '../../../types/formBuilder.types';

const DropdownFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const options: ChoiceOption[] = values.config?.options ?? [];
  const isMultiple = values.fieldType === 'MULTIPLE_DROPDOWN';

  const updateOption = (index: number, val: string) => {
    const updated = options.map((opt, i) =>
      i === index
        ? { label: val, value: val.toLowerCase().replace(/\s+/g, '_') }
        : opt
    );
    setFieldValue('config.options', updated);
  };

  const addOption = () => {
    const newOpt: ChoiceOption = {
      label: `Option ${options.length + 1}`,
      value: `option_${uuidv4().slice(0, 6)}`,
    };
    setFieldValue('config.options', [...options, newOpt]);
  };

  const removeOption = (index: number) => {
    setFieldValue('config.options', options.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fb-properties__section-title">
        <i className="pi pi-list" /> Dropdown Options
      </div>
      <div className="fb-options-list">
        {options.map((opt, i) => (
          <div key={i} className="fb-option-row">
            <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)', width: 20, textAlign: 'center' }}>
              {i + 1}.
            </span>
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt.label}
              onChange={(e) => updateOption(i, e.target.value)}
            />
            <button
              type="button"
              className="fb-icon-btn danger"
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

      <div className="fb-divider" />

      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Searchable</div>
          <div className="fb-toggle-desc">Allow users to filter options by typing</div>
        </div>
        <Form.Check
          type="switch"
          id="config.filterable"
          checked={values.config?.filterable ?? true}
          onChange={(e) => setFieldValue('config.filterable', e.target.checked)}
        />
      </div>

      {isMultiple && (
        <Form.Group controlId="config.maxSelect" className="mt-2">
          <Form.Label>Max Selections</Form.Label>
          <Form.Control
            type="number"
            size="sm"
            value={values.config?.maxSelect ?? ''}
            placeholder="Unlimited"
            onChange={(e) =>
              setFieldValue('config.maxSelect', e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </Form.Group>
      )}
    </>
  );
};

export default DropdownFieldConfig;
