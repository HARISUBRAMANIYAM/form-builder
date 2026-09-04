import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Field, ErrorMessage, useFormikContext } from 'formik';

const ConsentFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.consentText">
            <Form.Label>
              Consent Text <span style={{ color: 'var(--fb-danger)' }}>*</span>
            </Form.Label>
            <Field
              as="textarea"
              name="config.consentText"
              rows={4}
              placeholder="Enter the consent statement the user must agree to..."
              className="form-control"
              style={{ resize: 'vertical', fontSize: '0.8125rem' }}
            />
            <ErrorMessage name="config.consentText" component="div" className="invalid-feedback d-block" />
          </Form.Group>
        </Col>
      </Row>

      {/* Live preview */}
      <div style={{
        padding: '10px 12px',
        background: 'var(--fb-surface-2)',
        borderRadius: 8,
        border: '1px solid var(--fb-border)',
        marginBottom: 8,
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--fb-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preview
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <input type="checkbox" disabled style={{ marginTop: 2, accentColor: 'var(--fb-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--fb-text-secondary)', lineHeight: 1.5 }}>
            {values.config?.consentText || 'Your consent text will appear here...'}
          </span>
        </div>
      </div>

      <div className="fb-divider" />

      <div style={{ padding: '8px 10px', background: 'var(--fb-warning-light)', borderRadius: 6, fontSize: '0.75rem', color: '#92400e', display: 'flex', gap: 6 }}>
        <i className="pi pi-exclamation-triangle" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Consent fields are always <strong>mandatory</strong>. The user must check this before submitting.</span>
      </div>
    </>
  );
};

export default ConsentFieldConfig;
