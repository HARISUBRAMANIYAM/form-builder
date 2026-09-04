import React, { useEffect } from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Col, Form, Row } from 'react-bootstrap';
import { FIELD_TYPE_MAP } from '../../constants/fieldTypeRegistry';
import { useFormBuilderStore } from '../../store/useFormBuilderStore';

// Phase 1 sub-config components
import TextFieldConfig from './fields/TextFieldConfig';
import NumberFieldConfig from './fields/NumberFieldConfig';
import DateFieldConfig from './fields/DateFieldConfig';
import ChoiceFieldConfig from './fields/ChoiceFieldConfig';
import DropdownFieldConfig from './fields/DropdownFieldConfig';
// Phase 2 sub-config components
import AttachmentFieldConfig from './fields/AttachmentFieldConfig';
import PictureFieldConfig from './fields/PictureFieldConfig';
import SignatureFieldConfig from './fields/SignatureFieldConfig';
import RatingFieldConfig from './fields/RatingFieldConfig';
import ScaleFieldConfig from './fields/ScaleFieldConfig';
import RankOrderFieldConfig from './fields/RankOrderFieldConfig';
import ScaleGridFieldConfig from './fields/ScaleGridFieldConfig';
import CurrencyFieldConfig from './fields/CurrencyFieldConfig';
import ConsentFieldConfig from './fields/ConsentFieldConfig';
import UserDefinedFieldConfig from './fields/UserDefinedFieldConfig';
import SystemAttributeFieldConfig from './fields/SystemAttributeFieldConfig';
import { FieldType, type FormField } from '../../types/formBuilder.types';
import { useShallow } from 'zustand/shallow';

// ─── Validation Schema ───────────────────────────────────────────────

const buildValidationSchema = (allFields: FormField[], currentId: string) =>
  Yup.object({
    fieldCode: Yup.string()
      .required('Field Code is required')
      .matches(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens allowed')
      .test('unique-code', 'Field code must be unique', function (value) {
        if (!value) return true;
        const isDuplicate = allFields.some(
          (f) => f.fieldCode === value.trim() && f.id !== currentId
        );
        return !isDuplicate;
      }),
    fieldName: Yup.string().required('Field Name is required'),
    placeholder: Yup.string().nullable(),
    helpText: Yup.string().nullable(),
    defaultValue: Yup.string().nullable(),
  });

// ─── Empty State ─────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="fb-properties__empty">
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: 'var(--fb-surface-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, color: 'var(--fb-text-muted)',
    }}>
      <i className="pi pi-sliders-h" />
    </div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fb-text-secondary)' }}>
      No field selected
    </div>
    <div style={{ fontSize: '0.775rem', color: 'var(--fb-text-muted)', lineHeight: 1.5 }}>
      Click on a field in the canvas to<br />configure its properties here.
    </div>
  </div>
);

// ─── Type-specific config renderer ──────────────────────────────────

const TypeSpecificConfig: React.FC<{ field: FormField }> = ({ field }) => {
  const { fieldType, config } = field;

  switch (fieldType) {
    // ── Phase 1 ──────────────────────────────────────────────
    case FieldType.TEXT:
    case FieldType.TEXTAREA:
      return <TextFieldConfig config={config as any} />;

    case FieldType.NUMBER:
      return <NumberFieldConfig />;

    case FieldType.DATE:
    case FieldType.DATETIME:
    case FieldType.TIME:
      return <DateFieldConfig />;

    case FieldType.SINGLE_CHOICE:
    case FieldType.MULTIPLE_CHOICE:
      return <ChoiceFieldConfig />;

    case FieldType.SINGLE_DROPDOWN:
    case FieldType.MULTIPLE_DROPDOWN:
      return <DropdownFieldConfig />;

    case FieldType.EMAIL:
      return (
        <div style={{ padding: '8px 0' }}>
          <small className="text-muted">
            <i className="pi pi-info-circle me-1" />
            Standard RFC-5322 email format validation will be applied automatically.
          </small>
        </div>
      );

    case FieldType.PHONE:
      return (
        <div style={{ padding: '8px 0' }}>
          <small className="text-muted">
            <i className="pi pi-info-circle me-1" />
            Standard phone number validation will be applied automatically.
          </small>
        </div>
      );

    case FieldType.BOOLEAN:
      return (
        <div style={{ padding: '8px 0' }}>
          <small className="text-muted">
            <i className="pi pi-info-circle me-1" />
            Renders as a Yes / No toggle switch. Cannot be set as mandatory.
          </small>
        </div>
      );

    // ── Phase 2 ──────────────────────────────────────────────
    case FieldType.ATTACHMENT:
      return <AttachmentFieldConfig />;

    case FieldType.PICTURE:
      return <PictureFieldConfig />;

    case FieldType.SIGNATURE:
      return <SignatureFieldConfig />;

    case FieldType.RATING:
      return <RatingFieldConfig />;

    case FieldType.SCALE_SINGLE:
      return <ScaleFieldConfig />;

    case FieldType.RANK_ORDER:
      return <RankOrderFieldConfig />;

    case FieldType.SCALE_MULTI_GRID:
      return <ScaleGridFieldConfig isCheckbox={false} />;

    case FieldType.SCALE_CHECKBOX_GRID:
      return <ScaleGridFieldConfig isCheckbox={true} />;

    case FieldType.CURRENCY:
      return <CurrencyFieldConfig />;

    case FieldType.CONSENT:
      return <ConsentFieldConfig />;

    case FieldType.USER_DEFINED:
      return <UserDefinedFieldConfig />;

    case FieldType.SYSTEM_ATTRIBUTE:
      return <SystemAttributeFieldConfig />;

    default:
      return null;
  }
};


// ─── Properties Panel ────────────────────────────────────────────────

const PropertiesPanel: React.FC = () => {
  const { selectedField, allFields, updateField, updateFieldConfig } = useFormBuilderStore(useShallow((s) => ({
    selectedField: s.getSelectedField(),
    allFields: s.formDefinition.fields,
    updateField: s.updateField,
    updateFieldConfig: s.updateFieldConfig,
  })));

  if (!selectedField) {
    return (
      <aside className="fb-properties">
        <div className="fb-panel-header">
          <h6>Field Properties</h6>
        </div>
        <EmptyState />
      </aside>
    );
  }

  const registryEntry = FIELD_TYPE_MAP.get(selectedField.fieldType);

  // ── Formik Initial Values ──
  const initialValues = {
    fieldCode: selectedField.fieldCode,
    fieldName: selectedField.fieldName,
    placeholder: selectedField.placeholder ?? '',
    helpText: selectedField.helpText ?? '',
    defaultValue: selectedField.defaultValue ?? '',
    isMandatory: selectedField.isMandatory,
    isActive: selectedField.isActive,
    fieldType: selectedField.fieldType,
    config: { ...selectedField.config },
  };

  const validationSchema = buildValidationSchema(allFields, selectedField.id);

  // ── Auto-save on every change ──
  const handleAutoSave = (values: typeof initialValues) => {
    const { fieldCode, fieldName, placeholder, helpText, defaultValue, isMandatory, isActive, config } = values;
    updateField(selectedField.id, { fieldCode, fieldName, placeholder, helpText, defaultValue, isMandatory, isActive });
    updateFieldConfig(selectedField.id, config as any);
  };

  const handleSubmit = (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    handleAutoSave(values);
    setSubmitting(false);
  };

  return (
    <aside className="fb-properties">
      {/* Panel Header */}
      <div className="fb-panel-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: 'var(--fb-primary-ghost)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fb-primary)', fontSize: 11,
        }}>
          <i className={registryEntry?.icon ?? 'pi pi-question'} />
        </div>
        <h6 style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fb-text-muted)' }}>
          {registryEntry?.label ?? selectedField.fieldType}
        </h6>
      </div>

      {/* Formik Form */}
      <Formik
        key={selectedField.id}           /* re-mount when a different field is selected */
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, touched, errors, handleBlur, setFieldValue }) => {
          // Auto-save whenever values change
          useEffect(() => {
            const timeout = setTimeout(() => handleAutoSave(values), 300);
            return () => clearTimeout(timeout);
          }, [JSON.stringify(values)]);

          return (
            <FormikForm className="fb-properties__scroll">

              {/* ── General Section ── */}
              <div className="fb-properties__section">
                <div className="fb-properties__section-title">
                  <i className="pi pi-tag" /> General
                </div>

                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-fieldName">
                      <Form.Label>
                        Field Label <span style={{ color: 'var(--fb-danger)' }}>*</span>
                      </Form.Label>
                      <Field
                        name="fieldName"
                        type="text"
                        placeholder="e.g. Full Name"
                        className={`form-control ${touched.fieldName && errors.fieldName ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="fieldName" component="div" className="invalid-feedback d-block" />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-fieldCode">
                      <Form.Label>
                        Field Code <span style={{ color: 'var(--fb-danger)' }}>*</span>
                      </Form.Label>
                      <Field
                        name="fieldCode"
                        type="text"
                        placeholder="e.g. full_name"
                        className={`form-control ${touched.fieldCode && errors.fieldCode ? 'is-invalid' : ''}`}
                        onBlur={handleBlur}
                      />
                      <ErrorMessage name="fieldCode" component="div" className="invalid-feedback d-block" />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-placeholder">
                      <Form.Label>Placeholder</Form.Label>
                      <Field
                        name="placeholder"
                        type="text"
                        placeholder="Hint text shown inside the input"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-helpText">
                      <Form.Label>Help Text</Form.Label>
                      <Field
                        as="textarea"
                        name="helpText"
                        rows={2}
                        placeholder="Guidance text shown below the field"
                        className="form-control"
                        style={{ resize: 'vertical' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Default value — only for simple types */}
                {[FieldType.TEXT, FieldType.NUMBER, FieldType.EMAIL, FieldType.PHONE].includes(values.fieldType as FieldType) && (
                  <Row className="mb-2">
                    <Col>
                      <Form.Group controlId="prop-defaultValue">
                        <Form.Label>Default Value</Form.Label>
                        <Field
                          name="defaultValue"
                          type="text"
                          placeholder="Pre-filled value"
                          className="form-control"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </div>

              <div className="fb-divider" />

              {/* ── Validation Section ── */}
              <div className="fb-properties__section">
                <div className="fb-properties__section-title">
                  <i className="pi pi-shield" /> Validation
                </div>

                <div className="fb-toggle-row">
                  <div>
                    <div className="fb-toggle-label">Required Field</div>
                    <div className="fb-toggle-desc">User must fill this before submitting</div>
                  </div>
                  <Form.Check
                    type="switch"
                    id="prop-isMandatory"
                    checked={values.isMandatory}
                    disabled={values.fieldType === FieldType.BOOLEAN}
                    onChange={(e) => setFieldValue('isMandatory', e.target.checked)}
                  />
                </div>

                <div className="fb-toggle-row">
                  <div>
                    <div className="fb-toggle-label">Active</div>
                    <div className="fb-toggle-desc">Show / hide this field on the form</div>
                  </div>
                  <Form.Check
                    type="switch"
                    id="prop-isActive"
                    checked={values.isActive}
                    onChange={(e) => setFieldValue('isActive', e.target.checked)}
                  />
                </div>
              </div>

              {/* ── Type-specific config ── */}
              {([
                FieldType.TEXT, FieldType.TEXTAREA, FieldType.NUMBER,
                FieldType.DATE, FieldType.DATETIME, FieldType.TIME,
                FieldType.SINGLE_CHOICE, FieldType.MULTIPLE_CHOICE,
                FieldType.SINGLE_DROPDOWN, FieldType.MULTIPLE_DROPDOWN,
                FieldType.EMAIL, FieldType.PHONE, FieldType.BOOLEAN,
              ] as string[]).includes(values.fieldType) && (
                <>
                  <div className="fb-divider" />
                  <div className="fb-properties__section">
                    <div className="fb-properties__section-title">
                      <i className="pi pi-cog" /> Field Settings
                    </div>
                    <TypeSpecificConfig field={{ ...selectedField, config: values.config as any }} />
                  </div>
                </>
              )}

            </FormikForm>
          );
        }}
      </Formik>
    </aside>
  );
};

export default PropertiesPanel;
