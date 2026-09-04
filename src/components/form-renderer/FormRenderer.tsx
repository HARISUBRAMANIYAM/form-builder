import React from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Col, Form, Row, Button } from 'react-bootstrap';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { type FormDefinition, type FormField, FieldType, type ChoiceOption } from '../../types/formBuilder.types';

interface FormRendererProps {
  formDefinition: FormDefinition;
}

// ─── Build Yup schema from FormDefinition ───────────────────────────

const buildYupSchema = (fields: FormField[]) => {
  const shape: Record<string, Yup.AnySchema> = {};

  fields.filter((f) => f.isActive).forEach((field) => {
    let schema: Yup.AnySchema = Yup.mixed().nullable();

    switch (field.fieldType) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA: {
        let s = Yup.string().nullable();
        const cfg = field.config as any;
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        if (cfg?.maxLength) s = s.max(cfg.maxLength, `Max ${cfg.maxLength} characters`);
        if (cfg?.regex) s = s.matches(new RegExp(cfg.regex), 'Invalid format');
        schema = s;
        break;
      }
      case FieldType.NUMBER: {
        let s = Yup.number().nullable().typeError('Must be a valid number');
        const cfg = field.config as any;
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        if (cfg?.min !== undefined && cfg.min !== '') s = s.min(cfg.min, `Minimum value is ${cfg.min}`);
        if (cfg?.max !== undefined && cfg.max !== '') s = s.max(cfg.max, `Maximum value is ${cfg.max}`);
        if (!cfg?.allowDecimal) s = s.integer('Decimal values are not allowed');
        schema = s;
        break;
      }
      case FieldType.EMAIL: {
        let s = Yup.string().email('Please enter a valid email address').nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        schema = s;
        break;
      }
      case FieldType.PHONE: {
        let s = Yup.string().nullable().matches(/^[+\d\s()-]{7,20}$/, 'Please enter a valid phone number');
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        schema = s;
        break;
      }
      case FieldType.DATE:
      case FieldType.DATETIME:
      case FieldType.TIME: {
        let s = Yup.mixed().nullable();
        if (field.isMandatory) s = (s as any).required(`${field.fieldName} is required`);
        schema = s;
        break;
      }
      case FieldType.SINGLE_CHOICE:
      case FieldType.SINGLE_DROPDOWN: {
        let s = Yup.string().nullable();
        if (field.isMandatory) s = s.required(`${field.fieldName} is required`);
        schema = s;
        break;
      }
      case FieldType.MULTIPLE_CHOICE:
      case FieldType.MULTIPLE_DROPDOWN: {
        const cfg = field.config as any;
        let s = Yup.array().nullable();
        if (field.isMandatory) s = s.min(1, `Please select at least one ${field.fieldName}`);
        if (cfg?.minSelect) s = s.min(cfg.minSelect, `Select at least ${cfg.minSelect}`);
        if (cfg?.maxSelect) s = s.max(cfg.maxSelect, `Select at most ${cfg.maxSelect}`);
        schema = s;
        break;
      }
      default:
        break;
    }

    shape[field.fieldCode] = schema;
  });

  return Yup.object(shape);
};

// ─── Build initial values ────────────────────────────────────────────

const buildInitialValues = (fields: FormField[]): Record<string, any> => {
  const vals: Record<string, any> = {};

  fields.filter((f) => f.isActive).forEach((field) => {
    const cfg = field.config as any;
    switch (field.fieldType) {
      case FieldType.MULTIPLE_CHOICE:
      case FieldType.MULTIPLE_DROPDOWN:
        vals[field.fieldCode] = [];
        break;
      case FieldType.BOOLEAN:
        vals[field.fieldCode] = false;
        break;
      case FieldType.DATE:
        vals[field.fieldCode] =
          cfg?.quickDefault === 'CURRENTDATE' ? new Date() : null;
        break;
      case FieldType.DATETIME:
        vals[field.fieldCode] =
          cfg?.quickDefault === 'CURRENTDATETIME' ? new Date() : null;
        break;
      case FieldType.TIME:
        vals[field.fieldCode] =
          cfg?.quickDefault === 'CURRENTTIME' ? new Date() : null;
        break;
      default:
        vals[field.fieldCode] = field.defaultValue ?? '';
    }
  });

  return vals;
};

// ─── Individual Field Renderers ──────────────────────────────────────

const RenderedField: React.FC<{
  field: FormField;
  touched: any;
  errors: any;
  values: any;
  setFieldValue: (name: string, val: any) => void;
  handleBlur: any;
}> = ({ field, touched, errors, values, setFieldValue, handleBlur }) => {
  const cfg = field.config as any;
  const key = field.fieldCode;
  const hasError = touched[key] && errors[key];
  const options: ChoiceOption[] = cfg?.options ?? [];

  const renderInput = () => {
    switch (field.fieldType) {
      case FieldType.TEXT:
        return (
          <Field
            name={key}
            type="text"
            placeholder={field.placeholder ?? ''}
            maxLength={cfg?.maxLength}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <Field
            as="textarea"
            name={key}
            placeholder={field.placeholder ?? ''}
            maxLength={cfg?.maxLength}
            rows={cfg?.rows ?? 4}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            style={{ resize: 'vertical' }}
          />
        );

      case FieldType.NUMBER:
        return (
          <Field
            name={key}
            type="number"
            step={cfg?.allowDecimal ? 'any' : '1'}
            min={cfg?.min}
            max={cfg?.max}
            placeholder={field.placeholder ?? ''}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );

      case FieldType.EMAIL:
        return (
          <Field
            name={key}
            type="email"
            placeholder={field.placeholder ?? 'user@example.com'}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );

      case FieldType.PHONE:
        return (
          <Field
            name={key}
            type="tel"
            placeholder={field.placeholder ?? '+1 (555) 000-0000'}
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
          />
        );

      case FieldType.BOOLEAN:
        return (
          <Form.Check
            type="switch"
            id={`field-${key}`}
            label={values[key] ? 'Yes' : 'No'}
            checked={values[key] ?? false}
            onChange={(e) => setFieldValue(key, e.target.checked)}
          />
        );

      case FieldType.DATE:
        return (
          <Calendar
            inputId={`field-${key}`}
            value={values[key]}
            onChange={(e) => setFieldValue(key, e.value)}
            onBlur={handleBlur(key)}
            placeholder={field.placeholder ?? 'Select date'}
            dateFormat="dd/mm/yy"
            showIcon
            minDate={cfg?.minDate ? new Date(cfg.minDate) : undefined}
            maxDate={cfg?.maxDate ? new Date(cfg.maxDate) : undefined}
            className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }}
            appendTo="self"
          />
        );

      case FieldType.DATETIME:
        return (
          <Calendar
            inputId={`field-${key}`}
            value={values[key]}
            onChange={(e) => setFieldValue(key, e.value)}
            onBlur={handleBlur(key)}
            placeholder={field.placeholder ?? 'Select date & time'}
            dateFormat="dd/mm/yy"
            showTime
            showIcon
            className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }}
            appendTo="self"
          />
        );

      case FieldType.TIME:
        return (
          <Calendar
            inputId={`field-${key}`}
            value={values[key]}
            onChange={(e) => setFieldValue(key, e.value)}
            onBlur={handleBlur(key)}
            placeholder={field.placeholder ?? 'Select time'}
            timeOnly
            showIcon
            className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }}
            appendTo="self"
          />
        );

      case FieldType.SINGLE_CHOICE:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: cfg?.layout === 'horizontal' ? 'row' : 'column',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {options.map((opt) => (
              <Form.Check
                key={opt.value}
                type="radio"
                id={`${key}-${opt.value}`}
                name={key}
                label={opt.label}
                value={opt.value}
                checked={values[key] === opt.value}
                onChange={() => setFieldValue(key, opt.value)}
              />
            ))}
          </div>
        );

      case FieldType.MULTIPLE_CHOICE:
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: cfg?.layout === 'horizontal' ? 'row' : 'column',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {options.map((opt) => (
              <Form.Check
                key={opt.value}
                type="checkbox"
                id={`${key}-${opt.value}`}
                label={opt.label}
                checked={(values[key] ?? []).includes(opt.value)}
                onChange={(e) => {
                  const current: string[] = values[key] ?? [];
                  setFieldValue(
                    key,
                    e.target.checked
                      ? [...current, opt.value]
                      : current.filter((v) => v !== opt.value)
                  );
                }}
              />
            ))}
          </div>
        );

      case FieldType.SINGLE_DROPDOWN:
        return (
          <Dropdown
            inputId={`field-${key}`}
            value={values[key]}
            options={options}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setFieldValue(key, e.value)}
            onBlur={handleBlur(key)}
            placeholder={field.placeholder ?? `Select ${field.fieldName}`}
            filter={cfg?.filterable}
            filterPlaceholder="Search..."
            className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }}
            appendTo="self"
          />
        );

      case FieldType.MULTIPLE_DROPDOWN:
        return (
          <MultiSelect
            inputId={`field-${key}`}
            value={values[key]}
            options={options}
            optionLabel="label"
            optionValue="value"
            onChange={(e) => setFieldValue(key, e.value)}
            onBlur={handleBlur(key)}
            placeholder={field.placeholder ?? `Select ${field.fieldName}`}
            filter={cfg?.filterable}
            maxSelectedLabels={3}
            className={hasError ? 'p-invalid' : ''}
            style={{ width: '100%' }}
            appendTo="self"
          />
        );

      default:
        return (
          <div style={{ color: 'var(--fb-text-muted)', fontSize: '0.8rem' }}>
            Unsupported field type: {field.fieldType}
          </div>
        );
    }
  };

  return (
    <Form.Group className="fb-preview__field-group" controlId={`field-${key}`}>
      <Form.Label>
        {field.fieldName}
        {field.isMandatory && <span className="fb-preview__required-star">*</span>}
      </Form.Label>

      {renderInput()}

      {field.helpText && (
        <div className="fb-preview__help">{field.helpText}</div>
      )}

      <ErrorMessage name={key} component="div" className="invalid-feedback d-block" />
    </Form.Group>
  );
};

// ─── Form Renderer (main export) ────────────────────────────────────

const FormRenderer: React.FC<FormRendererProps> = ({ formDefinition }) => {
  const toast = React.useRef<Toast>(null);
  const activeFields = formDefinition.fields
    .filter((f) => f.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const validationSchema = React.useMemo(
    () => buildYupSchema(activeFields),
    [formDefinition.fields]
  );

  const initialValues = React.useMemo(
    () => buildInitialValues(activeFields),
    [formDefinition.fields]
  );

  const handleSubmit = (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    console.log('Form submitted:', values);
    toast.current?.show({
      severity: 'success',
      summary: 'Form Submitted',
      detail: 'Form data has been captured successfully.',
      life: 3000,
    });
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
            <p>No active fields in this form yet.</p>
            <p style={{ fontSize: '0.8rem' }}>Go back to the builder and add some fields!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-preview">
      <Toast ref={toast} />
      <div className="fb-preview__card">
        {/* Form Header */}
        <div className="fb-preview__header">
          <h2>{formDefinition.formName || 'Untitled Form'}</h2>
          {formDefinition.formDescription && (
            <p>{formDefinition.formDescription}</p>
          )}
        </div>

        {/* Formik Form Body */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ touched, errors, values, setFieldValue, handleBlur }) => (
            <FormikForm className="fb-preview__body">
              <Row>
                {activeFields.map((field) => (
                  <Col md={12} key={field.id}>
                    <RenderedField
                      field={field}
                      touched={touched}
                      errors={errors}
                      values={values}
                      setFieldValue={setFieldValue}
                      handleBlur={() => handleBlur}
                    />
                  </Col>
                ))}
              </Row>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <Button variant="outline-secondary" type="reset">
                  Clear
                </Button>
                <Button variant="primary" type="submit">
                  Submit Form
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default FormRenderer;
