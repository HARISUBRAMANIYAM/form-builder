import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Field, useFormikContext } from 'formik';

const UserDefinedFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const contentType: 'text' | 'image' = values.config?.contentType ?? 'text';

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.contentType">
            <Form.Label>Content Type</Form.Label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['text', 'image'] as const).map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setFieldValue('config.contentType', ct)}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    borderColor: contentType === ct ? 'var(--fb-primary)' : 'var(--fb-border)',
                    background: contentType === ct ? 'var(--fb-primary-ghost)' : 'transparent',
                    color: contentType === ct ? 'var(--fb-primary)' : 'var(--fb-text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={ct === 'text' ? 'pi pi-align-left' : 'pi pi-image'} />
                  {ct === 'text' ? 'Plain Text' : 'Image'}
                </button>
              ))}
            </div>
          </Form.Group>
        </Col>
      </Row>

      {contentType === 'text' && (
        <Row className="mb-2">
          <Col>
            <Form.Group controlId="config.content">
              <Form.Label>Content</Form.Label>
              <Field
                as="textarea"
                name="config.content"
                rows={5}
                placeholder="Enter static text / instructions / section header..."
                className="form-control"
                style={{ resize: 'vertical', fontSize: '0.8125rem' }}
              />
              <small className="text-muted">This text will be displayed as a static block on the form.</small>
            </Form.Group>
          </Col>
        </Row>
      )}

      {contentType === 'image' && (
        <>
          <Row className="mb-2">
            <Col>
              <Form.Group controlId="config.imageUrl">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  size="sm"
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={values.config?.imageUrl ?? ''}
                  onChange={(e) => setFieldValue('config.imageUrl', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col xs={6}>
              <Form.Group controlId="config.imageWidth">
                <Form.Label>Width</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="e.g. 100% or 400px"
                  value={values.config?.imageWidth ?? '100%'}
                  onChange={(e) => setFieldValue('config.imageWidth', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group controlId="config.imageAlt">
                <Form.Label>Alt Text</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Image description"
                  value={values.config?.imageAlt ?? ''}
                  onChange={(e) => setFieldValue('config.imageAlt', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          {values.config?.imageUrl && (
            <div style={{ marginTop: 6 }}>
              <img
                src={values.config.imageUrl}
                alt={values.config?.imageAlt ?? 'preview'}
                style={{ width: values.config?.imageWidth ?? '100%', borderRadius: 8, border: '1px solid var(--fb-border)' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}
        </>
      )}

      <div className="fb-divider" />
      <div style={{ fontSize: '0.75rem', color: 'var(--fb-text-muted)', display: 'flex', gap: 6 }}>
        <i className="pi pi-info-circle" style={{ flexShrink: 0 }} />
        <span>This field displays static content — users do not interact with it.</span>
      </div>
    </>
  );
};

export default UserDefinedFieldConfig;
