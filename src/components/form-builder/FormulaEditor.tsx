import React, { useState, useEffect } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { evaluateFormula } from '../../utils/formulaEvaluator';
import type { FormField, FormulaConfig } from '../../types/formBuilder.types';

interface FormulaEditorProps {
  field: FormField;
  otherFields: FormField[];
  onChange: (config: FormulaConfig | undefined) => void;
}

export const FormulaEditor: React.FC<FormulaEditorProps> = ({
  field,
  otherFields,
  onChange,
}) => {
  const formulaConfig = field.formulaConfig || {
    isCalculated: false,
    expression: '',
    readOnlyCalculated: true,
  };

  const [isEnabled, setIsEnabled] = useState<boolean>(formulaConfig.isCalculated);
  const [expression, setExpression] = useState<string>(formulaConfig.expression || '');
  const [readOnlyCalculated, setReadOnlyCalculated] = useState<boolean>(
    formulaConfig.readOnlyCalculated !== undefined ? formulaConfig.readOnlyCalculated : true
  );

  const [testResult, setTestResult] = useState<{ value: any; error?: string }>({ value: '' });

  // Sync state when field prop changes
  useEffect(() => {
    setIsEnabled(field.formulaConfig?.isCalculated || false);
    setExpression(field.formulaConfig?.expression || '');
    setReadOnlyCalculated(field.formulaConfig?.readOnlyCalculated !== undefined ? field.formulaConfig.readOnlyCalculated : true);
  }, [field.id, field.formulaConfig]);

  // Run test evaluator when expression or fields change
  useEffect(() => {
    if (!isEnabled || !expression.trim()) {
      setTestResult({ value: '' });
      return;
    }
    // Create mock values for testing (10 for numbers, "Sample" for strings, today for dates)
    const mockValues: Record<string, any> = {};
    otherFields.forEach((f) => {
      mockValues[f.fieldCode] = f.fieldType === 'NUMBER' || f.fieldType === 'CURRENCY' ? 10 : 'Sample';
    });

    const res = evaluateFormula(expression, mockValues, otherFields);
    setTestResult(res);
  }, [isEnabled, expression, otherFields]);

  const handleToggle = (val: boolean) => {
    setIsEnabled(val);
    if (!val) {
      onChange(undefined);
    } else {
      onChange({
        isCalculated: true,
        expression,
        readOnlyCalculated,
      });
    }
  };

  const handleExpressionChange = (newExpr: string) => {
    setExpression(newExpr);
    if (isEnabled) {
      onChange({
        isCalculated: true,
        expression: newExpr,
        readOnlyCalculated,
      });
    }
  };

  const handleReadOnlyChange = (val: boolean) => {
    setReadOnlyCalculated(val);
    if (isEnabled) {
      onChange({
        isCalculated: true,
        expression,
        readOnlyCalculated: val,
      });
    }
  };

  const insertToken = (token: string) => {
    const newExpr = expression + token;
    handleExpressionChange(newExpr);
  };

  // Field dropdown options
  const fieldOptions = otherFields.map((f) => ({
    label: `${f.fieldName} ([${f.fieldCode}])`,
    value: `[${f.fieldCode}]`,
  }));

  const functionPresets = [
    { label: 'SUM', token: 'SUM([field_1], [field_2])' },
    { label: 'AVG', token: 'AVG([field_1], [field_2])' },
    { label: 'ROUND', token: 'ROUND([field_1], 2)' },
    { label: 'CONCAT', token: 'CONCAT([field_1], " ", [field_2])' },
    { label: 'DATEDIFF', token: 'DATEDIFF([start_date], [end_date], "days")' },
    { label: 'AGE', token: 'AGE([dob_date])' },
    { label: 'IF', token: 'IF([val] >= 50, "PASS", "FAIL")' },
  ];

  return (
    <div className="formula-editor border rounded p-3 bg-dark-subtle text-light mt-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <label className="fw-semibold text-warning m-0">
          <i className="pi pi-calculator me-2"></i>Formula & Calculation
        </label>
        <InputSwitch checked={isEnabled} onChange={(e) => handleToggle(e.value ?? false)} />
      </div>

      {isEnabled && (
        <div className="formula-controls">
          <div className="mb-3">
            <label className="form-label small text-muted">Insert Field Variable</label>
            <Dropdown
              options={fieldOptions}
              placeholder="Select field to insert..."
              onChange={(e) => e.value && insertToken(e.value)}
              className="w-100 p-inputtext-sm"
              disabled={otherFields.length === 0}
            />
            {otherFields.length === 0 && (
              <small className="text-muted d-block mt-1">Add other fields to reference them in formulas.</small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted">Quick Operators & Functions</label>
            <div className="d-flex flex-wrap gap-1 mb-2">
              {['+', '-', '*', '/', '(', ')', '%'].map((op) => (
                <Button
                  key={op}
                  type="button"
                  label={op}
                  className="p-button-sm p-button-outlined p-button-secondary py-1 px-2"
                  onClick={() => insertToken(` ${op} `)}
                />
              ))}
            </div>

            <div className="d-flex flex-wrap gap-1">
              {functionPresets.map((fn) => (
                <Button
                  key={fn.label}
                  type="button"
                  label={fn.label}
                  className="p-button-sm p-button-outlined p-button-info py-0 px-2 text-xs"
                  onClick={() => insertToken(fn.token)}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted">Formula Expression</label>
            <InputTextarea
              value={expression}
              onChange={(e) => handleExpressionChange(e.target.value)}
              rows={3}
              className="w-100 p-inputtext-sm font-monospace text-warning bg-dark"
              placeholder="e.g. [qty_field] * [price_field]"
            />
          </div>

          {/* Test Evaluator Preview */}
          <div className="mb-3 p-2 rounded bg-black text-light small border border-secondary">
            <div className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>Formula Preview (Live Test):</div>
            {testResult.error ? (
              <span className="text-danger">
                <i className="pi pi-exclamation-triangle me-1"></i>
                {testResult.error}
              </span>
            ) : (
              <span className="text-success fw-bold font-monospace">
                Result = {JSON.stringify(testResult.value)}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top border-secondary">
            <span className="small text-muted">Read-only in Form</span>
            <InputSwitch checked={readOnlyCalculated} onChange={(e) => handleReadOnlyChange(e.value ?? false)} />
          </div>
        </div>
      )}
    </div>
  );
};
