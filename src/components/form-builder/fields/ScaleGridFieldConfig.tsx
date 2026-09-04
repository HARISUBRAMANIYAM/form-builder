import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const ScaleGridFieldConfig: React.FC<{ isCheckbox?: boolean }> = ({ isCheckbox = false }) => {
  const { values, setFieldValue } = useFormikContext<any>();
  const rows: string[] = values.config?.rows ?? [];
  const columns: string[] = values.config?.columns ?? [];

  const updateRow = (i: number, val: string) => setFieldValue('config.rows', rows.map((r, ri) => ri === i ? val : r));
  const updateCol = (i: number, val: string) => setFieldValue('config.columns', columns.map((c, ci) => ci === i ? val : c));
  const addRow = () => setFieldValue('config.rows', [...rows, `Row ${rows.length + 1}`]);
  const addCol = () => setFieldValue('config.columns', [...columns, `Col ${columns.length + 1}`]);
  const removeRow = (i: number) => setFieldValue('config.rows', rows.filter((_, ri) => ri !== i));
  const removeCol = (i: number) => setFieldValue('config.columns', columns.filter((_, ci) => ci !== i));

  return (
    <>
      {/* Rows */}
      <div className="fb-properties__section-title">
        <i className="pi pi-bars" /> Rows (Questions / Items)
      </div>
      <div className="fb-options-list">
        {rows.map((row, i) => (
          <div key={i} className="fb-option-row">
            <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)', width: 18, textAlign: 'center' }}>{i + 1}.</span>
            <input type="text" value={row} placeholder={`Row ${i + 1}`} onChange={(e) => updateRow(i, e.target.value)} />
            <button type="button" className="fb-icon-btn danger" onClick={() => removeRow(i)} disabled={rows.length <= 1} style={{ flexShrink: 0 }}>
              <i className="pi pi-times" style={{ fontSize: 11 }} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fb-add-option-btn" onClick={addRow} style={{ marginBottom: 12 }}>
        <i className="pi pi-plus" style={{ fontSize: 11 }} /> Add Row
      </button>

      <div className="fb-divider" />

      {/* Columns */}
      <div className="fb-properties__section-title">
        <i className="pi pi-table" /> Columns ({isCheckbox ? 'Checkbox' : 'Radio'} Options)
      </div>
      <div className="fb-options-list">
        {columns.map((col, i) => (
          <div key={i} className="fb-option-row">
            <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)', width: 18, textAlign: 'center' }}>{i + 1}.</span>
            <input type="text" value={col} placeholder={`Column ${i + 1}`} onChange={(e) => updateCol(i, e.target.value)} />
            <button type="button" className="fb-icon-btn danger" onClick={() => removeCol(i)} disabled={columns.length <= 1} style={{ flexShrink: 0 }}>
              <i className="pi pi-times" style={{ fontSize: 11 }} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="fb-add-option-btn" onClick={addCol}>
        <i className="pi pi-plus" style={{ fontSize: 11 }} /> Add Column
      </button>

      <div className="fb-divider" />

      {/* Mini grid preview */}
      <div style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)', marginBottom: 6, fontWeight: 600 }}>Grid Preview</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ fontSize: '0.65rem', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '3px 6px', background: 'var(--fb-surface-2)', borderRadius: '4px 0 0 0' }}></th>
              {columns.map((col, ci) => (
                <th key={ci} style={{ padding: '3px 6px', textAlign: 'center', background: 'var(--fb-surface-2)', color: 'var(--fb-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {col || `Col ${ci + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td style={{ padding: '3px 6px', fontWeight: 500, color: 'var(--fb-text-secondary)', whiteSpace: 'nowrap', background: 'var(--fb-surface-2)' }}>
                  {row || `Row ${ri + 1}`}
                </td>
                {columns.map((_, ci) => (
                  <td key={ci} style={{ textAlign: 'center', padding: '3px 6px' }}>
                    <input type={isCheckbox ? 'checkbox' : 'radio'} disabled style={{ accentColor: 'var(--fb-primary)' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ScaleGridFieldConfig;
