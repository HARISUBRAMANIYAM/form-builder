import React from 'react';

interface ScaleGridRendererProps {
  rows: string[];
  columns: string[];
  value: Record<string, string | string[]>;
  onChange: (val: Record<string, string | string[]>) => void;
  isCheckbox?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

const ScaleGridRenderer: React.FC<ScaleGridRendererProps> = ({
  rows, columns, value, onChange, isCheckbox = false, disabled, hasError,
}) => {
  const handleChange = (rowKey: string, colKey: string, checked?: boolean) => {
    if (isCheckbox) {
      const current = (value[rowKey] as string[]) ?? [];
      const next = checked
        ? [...current, colKey]
        : current.filter((c) => c !== colKey);
      onChange({ ...value, [rowKey]: next });
    } else {
      onChange({ ...value, [rowKey]: colKey });
    }
  };

  return (
    <div
      style={{
        overflowX: 'auto',
        border: `1.5px solid ${hasError ? 'var(--fb-danger)' : 'var(--fb-border)'}`,
        borderRadius: 10,
        boxShadow: hasError ? '0 0 0 3px var(--fb-danger-light)' : undefined,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
        <thead>
          <tr style={{ background: 'var(--fb-surface-2)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--fb-text-secondary)', borderBottom: '1px solid var(--fb-border)', minWidth: 120 }}>
              {/* Row label header */}
            </th>
            {columns.map((col, ci) => (
              <th
                key={ci}
                style={{
                  padding: '10px 12px',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'var(--fb-text-secondary)',
                  borderBottom: '1px solid var(--fb-border)',
                  whiteSpace: 'nowrap',
                  minWidth: 80,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const rowKey = row;
            const rowValue = value[rowKey];
            return (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? 'var(--fb-surface)' : 'var(--fb-bg)',
                  borderBottom: ri < rows.length - 1 ? '1px solid var(--fb-border-light)' : undefined,
                }}
              >
                <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--fb-text-primary)' }}>
                  {row}
                </td>
                {columns.map((col, ci) => {
                  const colKey = col;
                  const isChecked = isCheckbox
                    ? Array.isArray(rowValue) && rowValue.includes(colKey)
                    : rowValue === colKey;
                  return (
                    <td key={ci} style={{ textAlign: 'center', padding: '10px 12px' }}>
                      <input
                        type={isCheckbox ? 'checkbox' : 'radio'}
                        name={isCheckbox ? undefined : `grid_${rowKey}`}
                        checked={isChecked}
                        disabled={disabled}
                        onChange={(e) => handleChange(rowKey, colKey, e.target.checked)}
                        style={{
                          width: 16, height: 16,
                          accentColor: 'var(--fb-primary)',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScaleGridRenderer;
