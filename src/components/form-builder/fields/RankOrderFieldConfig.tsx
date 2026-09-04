import React from 'react';
import { useFormikContext } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import type { ChoiceOption } from '../../../types/formBuilder.types';

const RankOrderFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const options: ChoiceOption[] = values.config?.options ?? [];

  const updateOption = (index: number, val: string) => {
    setFieldValue(
      'config.options',
      options.map((opt, i) =>
        i === index ? { label: val, value: val.toLowerCase().replace(/\s+/g, '_') } : opt
      )
    );
  };

  const addOption = () => {
    const newOpt: ChoiceOption = { label: `Item ${options.length + 1}`, value: `item_${uuidv4().slice(0, 6)}` };
    setFieldValue('config.options', [...options, newOpt]);
  };

  const removeOption = (index: number) => {
    setFieldValue('config.options', options.filter((_, i) => i !== index));
  };

  const moveOption = (index: number, dir: 'up' | 'down') => {
    const arr = [...options];
    const swapWith = dir === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= arr.length) return;
    [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
    setFieldValue('config.options', arr);
  };

  return (
    <>
      <div className="fb-properties__section-title">
        <i className="pi pi-sort" /> Items to Rank
      </div>
      <div className="fb-options-list">
        {options.map((opt, i) => (
          <div key={i} className="fb-option-row" style={{ gap: 4 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0,
            }}>
              <button type="button" className="fb-icon-btn" style={{ height: 14, fontSize: 9 }}
                onClick={() => moveOption(i, 'up')} disabled={i === 0}>
                <i className="pi pi-chevron-up" style={{ fontSize: 9 }} />
              </button>
              <button type="button" className="fb-icon-btn" style={{ height: 14, fontSize: 9 }}
                onClick={() => moveOption(i, 'down')} disabled={i === options.length - 1}>
                <i className="pi pi-chevron-down" style={{ fontSize: 9 }} />
              </button>
            </div>
            <span style={{
              width: 20, textAlign: 'center', fontSize: '0.7rem',
              color: 'var(--fb-text-muted)', background: 'var(--fb-surface-2)',
              borderRadius: 4, flexShrink: 0, lineHeight: '28px',
            }}>
              {i + 1}
            </span>
            <input
              type="text"
              value={opt.label}
              placeholder={`Item ${i + 1}`}
              onChange={(e) => updateOption(i, e.target.value)}
            />
            <button
              type="button"
              className="fb-icon-btn danger"
              onClick={() => removeOption(i)}
              disabled={options.length <= 2}
              style={{ flexShrink: 0 }}
            >
              <i className="pi pi-times" style={{ fontSize: 11 }} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fb-add-option-btn" onClick={addOption}>
        <i className="pi pi-plus" style={{ fontSize: 11 }} />
        Add Item
      </button>
      <div className="fb-divider" />
      <small className="text-muted">
        <i className="pi pi-info-circle me-1" />
        Users will drag to reorder these items by preference on the form.
      </small>
    </>
  );
};

export default RankOrderFieldConfig;
