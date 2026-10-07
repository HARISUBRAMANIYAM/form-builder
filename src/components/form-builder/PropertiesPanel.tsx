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
import { FormulaEditor } from './FormulaEditor';
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
  const { selectedField, allFields, pages, sections, updateField, updateFieldConfig } = useFormBuilderStore(useShallow((s) => ({
    selectedField: s.getSelectedField(),
    allFields: s.formDefinition.fields,
    pages: s.formDefinition.pages ?? [{ id: 'page-1', title: 'Page 1', displayOrder: 0 }],
    sections: s.formDefinition.sections ?? [],
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

                {/* Page Placement */}
                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-pageId">
                      <Form.Label>Assign to Page / Step</Form.Label>
                      <Form.Select
                        value={selectedField.pageId || (pages[0]?.id ?? 'page-1')}
                        onChange={(e) => updateField(selectedField.id, { pageId: e.target.value, sectionId: undefined })}
                        className="form-select text-light bg-dark border-secondary"
                      >
                        {pages.map((p, idx) => (
                          <option key={p.id} value={p.id}>
                            Step {idx + 1}: {p.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Section Placement */}
                {sections.filter((s) => s.pageId === (selectedField.pageId || pages[0]?.id)).length > 0 && (
                  <Row className="mb-2">
                    <Col>
                      <Form.Group controlId="prop-sectionId">
                        <Form.Label>Assign to Section</Form.Label>
                        <Form.Select
                          value={selectedField.sectionId || ''}
                          onChange={(e) => updateField(selectedField.id, { sectionId: e.target.value || undefined })}
                          className="form-select"
                        >
                          <option value="">(No Section - Direct in Page)</option>
                          {sections
                            .filter((s) => s.pageId === (selectedField.pageId || pages[0]?.id))
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                📁 {s.title}
                              </option>
                            ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                {/* Grid Column Width (Bootstrap Spacing) */}
                <Row className="mb-2">
                  <Col>
                    <Form.Group controlId="prop-columnSpan">
                      <Form.Label>Grid Column Width (Bootstrap)</Form.Label>
                      <div className="d-flex gap-1 mt-1">
                        {[
                          { span: 12, label: '100%', sub: 'Full Row', icon: 'pi-square' },
                          { span: 6, label: '50%', sub: '2 / Row', icon: 'pi-th-large' },
                          { span: 4, label: '33%', sub: '3 / Row', icon: 'pi-table' },
                          { span: 3, label: '25%', sub: '4 / Row', icon: 'pi-grid' },
                        ].map((opt) => {
                          const isSelected = (selectedField.columnSpan || 12) === opt.span;
                          return (
                            <button
                              key={opt.span}
                              type="button"
                              className={`btn btn-sm flex-fill d-flex flex-column align-items-center py-1 px-1 ${
                                isSelected ? 'btn-primary text-white fw-bold' : 'btn-outline-secondary'
                              }`}
                              style={{ fontSize: '0.72rem', borderRadius: '6px' }}
                              onClick={() => updateField(selectedField.id, { columnSpan: opt.span as any })}
                            >
                              <i className={`pi ${opt.icon} mb-1`} style={{ fontSize: '12px' }} />
                              <span>{opt.label}</span>
                              <span style={{ fontSize: '0.62rem', opacity: 0.8 }}>{opt.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
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
              <div className="fb-divider" />
              <div className="fb-properties__section">
                <div className="fb-properties__section-title">
                  <i className="pi pi-cog" /> Field Settings
                </div>
                <TypeSpecificConfig field={{ ...selectedField, config: values.config as any }} />
              </div>

              {/* ── Formula Builder Engine (Phase 3) ── */}
              <FormulaEditor
                field={selectedField}
                otherFields={allFields.filter((f) => f.id !== selectedField.id)}
                onChange={(formulaConfig) => updateField(selectedField.id, { formulaConfig })}
              />

            </FormikForm>
          );
        }}
      </Formik>
    </aside>
  );
};

export default PropertiesPanel;
