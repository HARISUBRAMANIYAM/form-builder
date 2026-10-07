import React, { useMemo } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Col, Form, Row, Button } from 'react-bootstrap';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import type { ChoiceOption, FieldType, FormDefinition, FormField, BranchingRule } from '../../types/formBuilder.types';
import SignaturePad from './SignaturePad';
import RankOrderRenderer from './RankOrderRenderer';
import ScaleGridRenderer from './ScaleGridRenderer';
// import { evaluateFormula } from '../../utils/formulaEvaluator';

interface FormRendererProps {
  formDefinition: FormDefinition;
}

// ─── Branching Engine ───────────────────────────────────────────────────

const evaluateBranchingRules = (
  rules: BranchingRule[],
  fields: FormField[],
  values: Record<string, any>
): Set<string> => {
  // Start: all fields visible
  const hiddenFieldIds = new Set<string>();

  rules.forEach((rule) => {
    if (rule.conditions.length === 0 || rule.targetFieldIds.length === 0) return;

    const conditionResults = rule.conditions.map((cond) => {
      const sourceField = fields.find((f) => f.id === cond.fieldId);
      if (!sourceField) return false;
      const fieldValue = String(values[sourceField.fieldCode] ?? '').trim().toLowerCase();
      const condValue = String(cond.value ?? '').trim().toLowerCase();

      switch (cond.operator) {
        case 'equals': return fieldValue === condValue;
        case 'not_equals': return fieldValue !== condValue;
        case 'contains': return fieldValue.includes(condValue);
        case 'greater_than': return parseFloat(fieldValue) > parseFloat(condValue);
        case 'less_than': return parseFloat(fieldValue) < parseFloat(condValue);
        default: return false;
      }
    });

    const ruleMatch = rule.conditionLogic === 'AND'
      ? conditionResults.every(Boolean)
      : conditionResults.some(Boolean);

    if (ruleMatch && rule.action === 'hide') {
      rule.targetFieldIds.forEach((id) => hiddenFieldIds.add(id));
    }
    if (!ruleMatch && rule.action === 'show') {
      rule.targetFieldIds.forEach((id) => hiddenFieldIds.add(id));
    }
  });

  return hiddenFieldIds;
};

// ─── Build Yup schema ───────────────────────────────────────────────────

const buildYupSchema = (fields: FormField[]) => {
  const shape: Record<string, Yup.AnySchema> = {};

  fields.filter((f) => f.isActive).forEach((field) => {
    const cfg = field.config as any;

    switch (field.fieldType as FieldType) {
      case 'TEXT' as FieldType:
      case 'TEXTAREA' as FieldType: {
        let s = Yup.string().nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        if (cfg?.maxLength) s = s.max(cfg.maxLength, `Max ${cfg.maxLength} characters`);
        if (cfg?.regex) { try { s = s.matches(new RegExp(cfg.regex), 'Invalid format'); } catch { } }
        shape[field.fieldCode] = s; break;
      }
      case 'NUMBER' as FieldType: {
        let s = Yup.number().nullable().typeError('Must be a valid number');
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        if (cfg?.min !== undefined && cfg.min !== '') s = s.min(cfg.min, `Min ${cfg.min}`);
        if (cfg?.max !== undefined && cfg.max !== '') s = s.max(cfg.max, `Max ${cfg.max}`);
        if (!cfg?.allowDecimal) s = s.integer('Decimals not allowed');
        shape[field.fieldCode] = s; break;
      }
      case 'EMAIL' as FieldType: {
        let s = Yup.string().email('Please enter a valid email').nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'PHONE' as FieldType: {
        let s = Yup.string().nullable().matches(/^[+\d\s()-]{7,20}$/, 'Invalid phone number');
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'DATE' as FieldType:
      case 'DATETIME' as FieldType:
      case 'TIME' as FieldType: {
        let s = Yup.mixed().nullable();
        if (field.isMandatory) s = (s as any).required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'SINGLE_CHOICE' as FieldType:
      case 'SINGLE_DROPDOWN' as FieldType: {
        let s = Yup.string().nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'MULTIPLE_CHOICE' as FieldType:
      case 'MULTIPLE_DROPDOWN' as FieldType: {
        let s = Yup.array().nullable();
        if (field.isMandatory) s = s.min(1, `Select at least one ${field.fieldName}`);
        if (cfg?.minSelect) s = s.min(cfg.minSelect, `Select at least ${cfg.minSelect}`);
        if (cfg?.maxSelect) s = s.max(cfg.maxSelect, `Select at most ${cfg.maxSelect}`);
        shape[field.fieldCode] = s; break;
      }
      case 'RANK_ORDER' as FieldType: {
        let s = Yup.array().nullable();
        if (field.isMandatory) s = s.min(1, `${field.fieldName} ranking is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'RATING' as FieldType: {
        let s = Yup.number().nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`).min(1, 'Please select a rating');
        shape[field.fieldCode] = s; break;
      }
      case 'SCALE_SINGLE' as FieldType: {
        let s = Yup.number().nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      case 'CURRENCY' as FieldType: {
        let s = Yup.number().nullable().typeError('Must be a valid amount');
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`).min(0, 'Amount cannot be negative');
        shape[field.fieldCode] = s; break;
      }
      case 'CONSENT' as FieldType: {
        shape[field.fieldCode] = Yup.boolean()
          .oneOf([true], 'You must consent to continue')
          .required('You must consent to continue');
        break;
      }
      case 'SIGNATURE' as FieldType: {
        let s = Yup.string().nullable();
        if (field.isMandatory) s = s.required('Signature is required').min(10, 'Please sign before submitting');
        shape[field.fieldCode] = s; break;
      }
      case 'ATTACHMENT' as FieldType:
      case 'PICTURE' as FieldType: {
        let s = Yup.mixed().nullable();
        if (field.isMandatory) s = (s as any).required(`${field.fieldName} is required`);
        shape[field.fieldCode] = s; break;
      }
      default:
        shape[field.fieldCode] = Yup.mixed().nullable();
    }
  });

  return Yup.object(shape);
};

// ─── Build initial values ───────────────────────────────────────────────

const buildInitialValues = (fields: FormField[]): Record<string, any> => {
  const vals: Record<string, any> = {};
  fields.filter((f) => f.isActive).forEach((field) => {
    const cfg = field.config as any;
    switch (field.fieldType as FieldType) {
      case 'MULTIPLE_CHOICE' as FieldType:
      case 'MULTIPLE_DROPDOWN' as FieldType:
      case 'RANK_ORDER' as FieldType: vals[field.fieldCode] = []; break;
      case 'BOOLEAN' as FieldType: vals[field.fieldCode] = false; break;
      case 'CONSENT' as FieldType: vals[field.fieldCode] = false; break;
      case 'DATE' as FieldType: vals[field.fieldCode] = cfg?.quickDefault === 'CURRENTDATE' ? new Date() : null; break;
      case 'DATETIME' as FieldType: vals[field.fieldCode] = cfg?.quickDefault === 'CURRENTDATETIME' ? new Date() : null; break;
      case 'TIME' as FieldType: vals[field.fieldCode] = cfg?.quickDefault === 'CURRENTTIME' ? new Date() : null; break;
      case 'SCALE_SINGLE' as FieldType: vals[field.fieldCode] = cfg?.min ?? 1; break;
      case 'RATING' as FieldType: vals[field.fieldCode] = null; break;
      case 'CURRENCY' as FieldType: vals[field.fieldCode] = null; break;
      case 'SCALE_MULTI_GRID' as FieldType:
      case 'SCALE_CHECKBOX_GRID' as FieldType: vals[field.fieldCode] = {}; break;
      case 'SIGNATURE' as FieldType: vals[field.fieldCode] = ''; break;
      case 'USER_DEFINED' as FieldType:
      case 'SYSTEM_ATTRIBUTE' as FieldType: /* no user value */ break;
      default: vals[field.fieldCode] = field.defaultValue ?? '';
    }
  });
  return vals;
};

// ─── Individual Field Renderer ──────────────────────────────────────────

const RenderedField: React.FC<{
  field: FormField;
  touched: any; errors: any; values: any;
  setFieldValue: (name: string, val: any) => void;
  handleBlur: any;
}> = ({ field, touched, errors, values, setFieldValue, handleBlur }) => {
  const cfg = field.config as any;
  const key = field.fieldCode;
  const hasError = Boolean(touched[key] && errors[key]);
  const options: ChoiceOption[] = cfg?.options ?? [];

  const renderInput = () => {
    switch (field.fieldType as FieldType) {

      // ── Phase 1 ────────────────────────────────────────────────────────
      case 'TEXT' as FieldType:
        return <Field name={key} type="text" placeholder={field.placeholder ?? ''} maxLength={cfg?.maxLength} className={`form-control ${hasError ? 'is-invalid' : ''}`} />;

      case 'TEXTAREA' as FieldType:
        return <Field as="textarea" name={key} placeholder={field.placeholder ?? ''} maxLength={cfg?.maxLength} rows={cfg?.rows ?? 4} className={`form-control ${hasError ? 'is-invalid' : ''}`} style={{ resize: 'vertical' }} />;

      case 'NUMBER' as FieldType:
        return <Field name={key} type="number" step={cfg?.allowDecimal ? 'any' : '1'} min={cfg?.min} max={cfg?.max} placeholder={field.placeholder ?? ''} className={`form-control ${hasError ? 'is-invalid' : ''}`} />;

      case 'EMAIL' as FieldType:
        return <Field name={key} type="email" placeholder={field.placeholder ?? 'user@example.com'} className={`form-control ${hasError ? 'is-invalid' : ''}`} />;

      case 'PHONE' as FieldType:
        return <Field name={key} type="tel" placeholder={field.placeholder ?? '+1 (555) 000-0000'} className={`form-control ${hasError ? 'is-invalid' : ''}`} />;

      case 'BOOLEAN' as FieldType:
        return <Form.Check type="switch" id={`field-${key}`} label={values[key] ? 'Yes' : 'No'} checked={values[key] ?? false} onChange={(e) => setFieldValue(key, e.target.checked)} />;

      case 'DATE' as FieldType:
        return (
          <Calendar inputId={`field-${key}`} value={values[key]} onChange={(e) => setFieldValue(key, e.value)} onBlur={handleBlur}
            placeholder={field.placeholder ?? 'Select date'} dateFormat="dd/mm/yy" showIcon
            minDate={cfg?.minDate ? new Date(cfg.minDate) : undefined} maxDate={cfg?.maxDate ? new Date(cfg.maxDate) : undefined}
            className={hasError ? 'p-invalid' : ''} style={{ width: '100%' }} appendTo="self" />
        );

      case 'DATETIME' as FieldType:
        return (
          <Calendar inputId={`field-${key}`} value={values[key]} onChange={(e) => setFieldValue(key, e.value)} onBlur={handleBlur}
            placeholder={field.placeholder ?? 'Select date & time'} dateFormat="dd/mm/yy" showTime showIcon
            className={hasError ? 'p-invalid' : ''} style={{ width: '100%' }} appendTo="self" />
        );

      case 'TIME' as FieldType:
        return (
          <Calendar inputId={`field-${key}`} value={values[key]} onChange={(e) => setFieldValue(key, e.value)} onBlur={handleBlur}
            placeholder={field.placeholder ?? 'Select time'} timeOnly showIcon
            className={hasError ? 'p-invalid' : ''} style={{ width: '100%' }} appendTo="self" />
        );

      case 'SINGLE_CHOICE' as FieldType:
        return (
          <div style={{ display: 'flex', flexDirection: cfg?.layout === 'horizontal' ? 'row' : 'column', gap: 10, flexWrap: 'wrap' }}>
            {options.map((opt) => (
              <Form.Check key={opt.value} type="radio" id={`${key}-${opt.value}`} name={key} label={opt.label} value={opt.value}
                checked={values[key] === opt.value} onChange={() => setFieldValue(key, opt.value)} />
            ))}
          </div>
        );

      case 'MULTIPLE_CHOICE' as FieldType:
        return (
          <div style={{ display: 'flex', flexDirection: cfg?.layout === 'horizontal' ? 'row' : 'column', gap: 10, flexWrap: 'wrap' }}>
            {options.map((opt) => (
              <Form.Check key={opt.value} type="checkbox" id={`${key}-${opt.value}`} label={opt.label}
                checked={(values[key] ?? []).includes(opt.value)}
                onChange={(e) => {
                  const cur: string[] = values[key] ?? [];
                  setFieldValue(key, e.target.checked ? [...cur, opt.value] : cur.filter((v) => v !== opt.value));
                }} />
            ))}
          </div>
        );

      case 'SINGLE_DROPDOWN' as FieldType:
        return (
          <Dropdown inputId={`field-${key}`} value={values[key]} options={options} optionLabel="label" optionValue="value"
            onChange={(e) => setFieldValue(key, e.value)} placeholder={field.placeholder ?? `Select ${field.fieldName}`}
            filter={cfg?.filterable} filterPlaceholder="Search..." className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }} appendTo="self" />
        );

      case 'MULTIPLE_DROPDOWN' as FieldType:
        return (
          <MultiSelect inputId={`field-${key}`} value={values[key]} options={options} optionLabel="label" optionValue="value"
            onChange={(e) => setFieldValue(key, e.value)} placeholder={field.placeholder ?? `Select ${field.fieldName}`}
            filter={cfg?.filterable} maxSelectedLabels={3} className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }} appendTo="self" />
        );

      // ── Phase 2 ────────────────────────────────────────────────────────
      case 'RATING' as FieldType:
        return (
          <div>
            <Rating
              value={values[key] ?? 0}
              onChange={(e) => setFieldValue(key, e.value)}
              stars={cfg?.maxRating ?? 5}
              cancel={false}
              style={{ color: '#F59E0B' }}
            />
            {cfg?.showLabel && values[key] > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--fb-text-muted)', marginTop: 4 }}>
                {values[key]} / {cfg?.maxRating ?? 5}
              </div>
            )}
          </div>
        );

      case 'SCALE_SINGLE' as FieldType: {
        const scaleMin = cfg?.min ?? 1;
        const scaleMax = cfg?.max ?? 10;
        const scaleStep = cfg?.step ?? 1;
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--fb-text-muted)', marginBottom: 8 }}>
              <span>{cfg?.labels?.min || scaleMin}</span>
              <span style={{ fontWeight: 600, color: 'var(--fb-primary)' }}>{values[key] ?? scaleMin}</span>
              <span>{cfg?.labels?.max || scaleMax}</span>
            </div>
            <Slider
              value={values[key] ?? scaleMin}
              min={scaleMin}
              max={scaleMax}
              step={scaleStep}
              onChange={(e) => setFieldValue(key, e.value)}
              className={hasError ? 'p-invalid' : ''}
              style={{ width: '100%' }}
            />
          </div>
        );
      }

      case 'RANK_ORDER' as FieldType:
        return (
          <RankOrderRenderer
            options={options}
            value={values[key] ?? []}
            onChange={(ranked) => setFieldValue(key, ranked)}
          />
        );

      case 'SCALE_MULTI_GRID' as FieldType:
        return (
          <ScaleGridRenderer
            rows={cfg?.rows ?? []}
            columns={cfg?.columns ?? []}
            value={values[key] ?? {}}
            onChange={(val) => setFieldValue(key, val)}
            isCheckbox={false}
            hasError={hasError}
          />
        );

      case 'SCALE_CHECKBOX_GRID' as FieldType:
        return (
          <ScaleGridRenderer
            rows={cfg?.rows ?? []}
            columns={cfg?.columns ?? []}
            value={values[key] ?? {}}
            onChange={(val) => setFieldValue(key, val)}
            isCheckbox={true}
            hasError={hasError}
          />
        );

      case 'CURRENCY' as FieldType: {
        const currencies: string[] = cfg?.currencies ?? ['USD'];
        const curKey = `${key}_currency`;
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {currencies.length > 1 && (
              <Form.Select
                style={{ width: 'auto', minWidth: 80, fontSize: '0.875rem' }}
                value={values[curKey] ?? (cfg?.defaultCurrency || currencies[0])}
                onChange={(e) => setFieldValue(curKey, e.target.value)}
              >
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            )}
            {currencies.length === 1 && (
              <span style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: 'var(--fb-surface-2)', border: '1px solid var(--fb-border)', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600, color: 'var(--fb-text-secondary)', flexShrink: 0 }}>
                {currencies[0]}
              </span>
            )}
            <Field
              name={key}
              type="number"
              step={cfg?.allowDecimal ? '0.01' : '1'}
              min={0}
              placeholder="0.00"
              className={`form-control ${hasError ? 'is-invalid' : ''}`}
              style={{ flex: 1 }}
            />
          </div>
        );
      }

      case 'CONSENT' as FieldType:
        return (
          <div style={{
            padding: '12px 14px',
            border: `1.5px solid ${hasError ? 'var(--fb-danger)' : 'var(--fb-border)'}`,
            borderRadius: 10,
            background: values[key] ? 'var(--fb-primary-ghost)' : 'var(--fb-surface-2)',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <input
                type="checkbox"
                id={`field-${key}`}
                checked={values[key] ?? false}
                onChange={(e) => setFieldValue(key, e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--fb-primary)', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor={`field-${key}`} style={{ fontSize: '0.875rem', color: 'var(--fb-text-primary)', cursor: 'pointer', lineHeight: 1.6, margin: 0 }}>
                {cfg?.consentText || 'I agree to the terms and conditions.'}
              </label>
            </div>
          </div>
        );

      case 'SIGNATURE' as FieldType:
        return (
          <SignaturePad
            value={values[key]}
            onChange={(dataUrl) => setFieldValue(key, dataUrl)}
            penColor={cfg?.penColor ?? '#000000'}
            penWidth={cfg?.penWidth ?? 2}
            showClear={cfg?.showClear ?? true}
            hasError={hasError}
          />
        );

      case 'ATTACHMENT' as FieldType:
        return (
          <div style={{
            border: `2px dashed ${hasError ? 'var(--fb-danger)' : 'var(--fb-border)'}`,
            borderRadius: 10,
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: values[key] ? 'var(--fb-success-light)' : 'var(--fb-surface-2)',
          }}>
            <input
              type="file"
              id={`field-${key}`}
              accept={(cfg?.allowedTypes ?? []).map((t: string) => `.${t}`).join(',')}
              multiple={(cfg?.maxFiles ?? 1) > 1}
              style={{ display: 'none' }}
              onChange={(e) => setFieldValue(key, e.target.files)}
            />
            <label htmlFor={`field-${key}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <i className={values[key] ? 'pi pi-check-circle' : 'pi pi-cloud-upload'} style={{ fontSize: 28, color: values[key] ? 'var(--fb-success)' : 'var(--fb-primary)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--fb-text-secondary)' }}>
                {values[key] ? `${values[key].length} file(s) selected` : 'Click to upload'}
              </span>
              {(cfg?.allowedTypes ?? []).length > 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--fb-text-muted)' }}>
                  Allowed: {(cfg.allowedTypes as string[]).join(', ').toUpperCase()} • Max {cfg?.maxSizeMB ?? 10}MB
                </span>
              )}
            </label>
          </div>
        );

      case 'PICTURE' as FieldType:
        return (
          <div style={{
            border: `2px dashed ${hasError ? 'var(--fb-danger)' : 'var(--fb-border)'}`,
            borderRadius: 10,
            padding: 20,
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--fb-surface-2)',
          }}>
            <input
              type="file"
              id={`field-${key}`}
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              multiple={cfg?.multiple ?? false}
              style={{ display: 'none' }}
              onChange={(e) => {
                setFieldValue(key, e.target.files);
                // Generate preview URLs
                if (e.target.files && e.target.files.length > 0) {
                  const urls = Array.from(e.target.files).map((f) => URL.createObjectURL(f));
                  setFieldValue(`${key}_previews`, urls);
                }
              }}
            />
            <label htmlFor={`field-${key}`} style={{ cursor: 'pointer' }}>
              {values[`${key}_previews`]?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {values[`${key}_previews`].map((url: string, i: number) => (
                    <img key={i} src={url} alt={`Preview ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--fb-border)' }} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <i className="pi pi-image" style={{ fontSize: 28, color: 'var(--fb-primary)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--fb-text-secondary)' }}>
                    {cfg?.multiple ? `Upload up to ${cfg?.maxCount ?? 5} images` : 'Upload image'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--fb-text-muted)' }}>JPG, PNG, GIF, WEBP • Max {cfg?.maxSizeMB ?? 5}MB</span>
                </div>
              )}
            </label>
          </div>
        );

      case 'USER_DEFINED' as FieldType:
        return (
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, var(--fb-surface-2), var(--fb-bg))',
            borderRadius: 10,
            borderLeft: '3px solid var(--fb-primary)',
          }}>
            {cfg?.contentType === 'image' ? (
              <img src={cfg?.imageUrl} alt={cfg?.imageAlt ?? ''} style={{ width: cfg?.imageWidth ?? '100%', borderRadius: 8 }} />
            ) : (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--fb-text-secondary)', lineHeight: 1.7 }}>
                {cfg?.content || 'Static information block'}
              </p>
            )}
          </div>
        );

      case 'SYSTEM_ATTRIBUTE' as FieldType: {
        const SYSTEM_ATTR_LABELS: Record<string, string> = {
          employeeId: 'EMP-001', employeeName: 'John Doe', department: 'Engineering',
          designation: 'Senior Developer', email: 'john.doe@company.com',
          managerName: 'Jane Smith', dateOfJoining: '2021-06-15', location: 'Headquarters',
          costCenter: 'CC-001', grade: 'L4', employmentType: 'Full-time',
          currentDate: new Date().toLocaleDateString(), currentUser: 'Current User',
        };
        const displayValue = SYSTEM_ATTR_LABELS[cfg?.attributeKey ?? ''] ?? '—';
        return (
          <div style={{
            padding: '8px 12px',
            background: 'var(--fb-surface-2)',
            border: '1px solid var(--fb-border)',
            borderRadius: 8,
            fontSize: '0.875rem',
            color: 'var(--fb-text-primary)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <i className="pi pi-database" style={{ color: 'var(--fb-primary)', fontSize: 14 }} />
            {displayValue}
            {!cfg?.allowOverride && (
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fb-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <i className="pi pi-lock" style={{ fontSize: 10 }} /> Auto-filled
              </span>
            )}
          </div>
        );
      }

      default:
        return <div style={{ color: 'var(--fb-text-muted)', fontSize: '0.8rem' }}>Field type not yet supported in preview.</div>;
    }
  };

  // USER_DEFINED has no label / required star
  const isDisplayOnly = (field.fieldType as string) === 'USER_DEFINED';

  return (
    <Form.Group className="fb-preview__field-group" controlId={`field-${key}`}>
      {!isDisplayOnly && (
        <Form.Label>
          {field.fieldName}
          {field.isMandatory && <span className="fb-preview__required-star">*</span>}
        </Form.Label>
      )}

      {renderInput()}

      {field.helpText && !isDisplayOnly && (
        <div className="fb-preview__help">{field.helpText}</div>
      )}

      <ErrorMessage name={key} component="div" className="invalid-feedback d-block" />
    </Form.Group>
  );
};

// ─── Collapsible Section Renderer for Preview ─────────────────────────

const RenderedSection: React.FC<{
  sectionTitle: string;
  sectionDesc?: string;
  isCollapsible?: boolean;
  children: React.ReactNode;
}> = ({ sectionTitle, sectionDesc, isCollapsible = true, children }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="fb-rendered-section">
      <div className="fb-rendered-section__header">
        <div className="d-flex align-items-center gap-2">
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
          <h6 className="fb-rendered-section__title">{sectionTitle}</h6>
        </div>
        {isCollapsible && (
          <button
            type="button"
            className="fb-icon-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`pi ${collapsed ? 'pi-chevron-down' : 'pi-chevron-up'}`} />
          </button>
        )}
      </div>
      {sectionDesc && <p style={{ fontSize: '0.8rem', color: 'var(--fb-text-muted)', marginBottom: 12 }}>{sectionDesc}</p>}
      {!collapsed && <div>{children}</div>}
    </div>
  );
};

// ─── Form Renderer Component ───────────────────────────────────────────

const FormRenderer: React.FC<FormRendererProps> = ({ formDefinition }) => {
  const toast = React.useRef<Toast>(null);
  const [activeStepIndex, setActiveStepIndex] = React.useState<number>(0);

  const pages = useMemo(
    () => formDefinition.pages && formDefinition.pages.length > 0
      ? formDefinition.pages
      : [{ id: 'page-1', title: 'Page 1', displayOrder: 0 }],
    [formDefinition.pages]
  );

  const sections = useMemo(
    () => formDefinition.sections ?? [],
    [formDefinition.sections]
  );

  const activeFields = useMemo(
    () => formDefinition.fields.filter((f) => f.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [formDefinition.fields]
  );

  const validationSchema = useMemo(() => buildYupSchema(activeFields), [activeFields]);
  const initialValues = useMemo(() => buildInitialValues(activeFields), [activeFields]);

  const currentPage = pages[activeStepIndex] || pages[0];
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === pages.length - 1;

  const handleSubmit = (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    console.log('Form submitted:', values);
    toast.current?.show({ severity: 'success', summary: 'Form Submitted', detail: 'Data captured successfully.', life: 3000 });
    setSubmitting(false);
  };

  if (activeFields.length === 0) {
    return (
      <div className="fb-preview">
        <div className="fb-preview__card">
          <div className="fb-preview__header">
            <h2>{formDefinition.formName}</h2>
            {formDefinition.formDescription && <p>{formDefinition.formDescription}</p>}
          </div>
          <div className="fb-preview__body" style={{ textAlign: 'center', padding: '40px', color: 'var(--fb-text-muted)' }}>
            <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: 12, display: 'block' }} />
            <p>No active fields. Add some fields in the builder!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-preview">
      <Toast ref={toast} />
      <div className="fb-preview__card">
        {/* Wizard Stepper Progress Bar */}
        {pages.length > 1 && (
          <div className="fb-wizard-stepper">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)' }}>
                Step {activeStepIndex + 1} of {pages.length}: <strong style={{ color: 'var(--fb-primary)' }}>{currentPage.title}</strong>
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--fb-primary)' }}>
                {Math.round(((activeStepIndex + 1) / pages.length) * 100)}% Completed
              </span>
            </div>

            <div className="fb-wizard-progress-bar">
              <div
                className="fb-wizard-progress-fill"
                style={{ width: `${((activeStepIndex + 1) / pages.length) * 100}%` }}
              />
            </div>

            {/* Stepper Dots */}
            <div className="d-flex justify-content-between mt-3 px-1">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="d-flex align-items-center gap-1"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: idx === activeStepIndex ? 700 : 500,
                    color: idx === activeStepIndex
                      ? 'var(--fb-primary)'
                      : idx < activeStepIndex
                        ? 'var(--fb-success)'
                        : 'var(--fb-text-muted)',
                    cursor: idx <= activeStepIndex ? 'pointer' : 'default',
                  }}
                  onClick={() => idx <= activeStepIndex && setActiveStepIndex(idx)}
                >
                  <i
                    className={`pi ${idx < activeStepIndex
                      ? 'pi-check-circle'
                      : idx === activeStepIndex
                        ? 'pi-circle-fill'
                        : 'pi-circle'
                      }`}
                    style={{
                      fontSize: 12,
                      color: idx === activeStepIndex
                        ? 'var(--fb-primary)'
                        : idx < activeStepIndex
                          ? 'var(--fb-success)'
                          : 'var(--fb-text-muted)',
                    }}
                  />
                  <span>{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="fb-preview__header">
          <h2>{formDefinition.formName || 'Untitled Form'}</h2>
          {currentPage.description ? (
            <p className="text-info">{currentPage.description}</p>
          ) : (
            formDefinition.formDescription && <p>{formDefinition.formDescription}</p>
          )}
        </div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
          {({ touched, errors, values, setFieldValue, setTouched, validateForm, handleBlur }) => {
            // ── Evaluate Branching Rules (Show/Hide & Page Jumps) ──
            const hiddenIds = evaluateBranchingRules(
              formDefinition.branchingRules ?? [],
              activeFields,
              values
            );

            // Filter visible fields
            const visibleFields = activeFields.filter((f) => !hiddenIds.has(f.id));

            // Fields belonging to CURRENT active page
            const currentStepFields = visibleFields.filter(
              (f) => (f.pageId ? f.pageId === currentPage.id : activeStepIndex === 0)
            );

            // Group current step fields into Sections
            const currentStepSections = sections.filter((s) => s.pageId === currentPage.id);
            const unsectionedFields = currentStepFields.filter((f) => !f.sectionId);

            // ── Handle Next Step Navigation with Validation & Page Jumps ──
            const handleNextStep = async () => {
              const validationErrors = await validateForm();

              // Find errors on fields belonging to the current step
              const stepHasErrors = currentStepFields.some((f) => Boolean(validationErrors[f.fieldCode]));

              if (stepHasErrors) {
                // Touch all fields on current step to trigger visual red errors
                const touchedPatch: Record<string, boolean> = {};
                currentStepFields.forEach((f) => {
                  touchedPatch[f.fieldCode] = true;
                });
                setTouched({ ...touched, ...touchedPatch });
                toast.current?.show({
                  severity: 'error',
                  summary: 'Validation Error',
                  detail: 'Please fix all required fields on this step before proceeding.',
                  life: 3000,
                });
                return;
              }

              // Check if any Branching Rule triggers a Page Jump
              let targetStepIndex = activeStepIndex + 1;
              const jumpRule = (formDefinition.branchingRules ?? []).find((r) => {
                if (r.action !== 'jump_to_page' || !r.targetPageId) return false;
                // Evaluate conditions
                const match = r.conditions.every((cond) => {
                  const src = activeFields.find((f) => f.id === cond.fieldId);
                  if (!src) return false;
                  const val = String(values[src.fieldCode] ?? '').trim().toLowerCase();
                  return val === String(cond.value ?? '').trim().toLowerCase();
                });
                return match;
              });

              if (jumpRule && jumpRule.targetPageId) {
                const pageIdx = pages.findIndex((p) => p.id === jumpRule.targetPageId);
                if (pageIdx !== -1) {
                  targetStepIndex = pageIdx;
                  toast.current?.show({
                    severity: 'info',
                    summary: 'Page Jump Rule',
                    detail: `Redirected to ${pages[pageIdx].title} based on your answer.`,
                    life: 2500,
                  });
                }
              }

              if (targetStepIndex < pages.length) {
                setActiveStepIndex(targetStepIndex);
              }
            };

            return (
              <FormikForm className="fb-preview__body">
                {/* <FormikFormulaRunner fields={activeFields} values={values} setFieldValue={setFieldValue} /> */}

                {/* 1. Render Sections for Current Page */}
                {currentStepSections.map((sec) => {
                  const secFields = currentStepFields.filter((f) => f.sectionId === sec.id);
                  if (secFields.length === 0) return null;
                  return (
                    <RenderedSection
                      key={sec.id}
                      sectionTitle={sec.title}
                      sectionDesc={sec.description}
                      isCollapsible={sec.isCollapsible}
                    >
                      <Row className="g-3">
                        {secFields.map((field) => (
                          <Col md={field.columnSpan || 12} key={field.id}>
                            <RenderedField
                              field={field}
                              touched={touched}
                              errors={errors}
                              values={values}
                              setFieldValue={setFieldValue}
                              handleBlur={handleBlur}
                            />
                          </Col>
                        ))}
                      </Row>
                    </RenderedSection>
                  );
                })}

                {/* 2. Render Un-sectioned Fields for Current Page */}
                <Row className="g-3">
                  {unsectionedFields.map((field) => (
                    <Col md={field.columnSpan || 12} key={field.id}>
                      <RenderedField
                        field={field}
                        touched={touched}
                        errors={errors}
                        values={values}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Stepper Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--fb-border-light)' }}>
                  <div>
                    {!isFirstStep && (
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setActiveStepIndex(activeStepIndex - 1)}
                      >
                        <i className="pi pi-arrow-left me-1" /> Previous Step
                      </Button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="outline-secondary" type="reset">
                      Clear Form
                    </Button>

                    {!isLastStep ? (
                      <Button variant="primary" type="button" onClick={handleNextStep}>
                        Next Step <i className="pi pi-arrow-right ms-1" />
                      </Button>
                    ) : (
                      <Button variant="success" type="submit">
                        <i className="pi pi-check me-1" /> Submit Form
                      </Button>
                    )}
                  </div>
                </div>
              </FormikForm>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default FormRenderer;

