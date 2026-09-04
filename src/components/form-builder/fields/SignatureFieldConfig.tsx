import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const SignatureFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.penColor">
            <Form.Label>Pen Color</Form.Label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['#000000', '#1e3a5f', '#4F46E5', '#064e3b', '#92400e'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFieldValue('config.penColor', color)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', background: color,
                    border: values.config?.penColor === color ? '3px solid var(--fb-primary)' : '2px solid var(--fb-border)',
                    cursor: 'pointer', padding: 0, outline: 'none',
                    boxShadow: values.config?.penColor === color ? '0 0 0 2px white, 0 0 0 4px var(--fb-primary)' : 'none',
                  }}
                />
              ))}
              <input
                type="color"
                value={values.config?.penColor ?? '#000000'}
                onChange={(e) => setFieldValue('config.penColor', e.target.value)}
                style={{ width: 28, height: 28, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0, background: 'none' }}
                title="Custom color"
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.penWidth">
            <Form.Label>Pen Thickness: {values.config?.penWidth ?? 2}px</Form.Label>
            <input
              type="range"
              min={1}
              max={6}
              step={0.5}
              value={values.config?.penWidth ?? 2}
              onChange={(e) => setFieldValue('config.penWidth', parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--fb-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--fb-text-muted)' }}>
              <span>Thin</span><span>Thick</span>
            </div>
          </Form.Group>
        </Col>
      </Row>

      <div className="fb-divider" />
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Show Clear Button</div>
          <div className="fb-toggle-desc">Let users erase and redo their signature</div>
        </div>
        <Form.Check
          type="switch"
          id="config.showClear"
          checked={values.config?.showClear ?? true}
          onChange={(e) => setFieldValue('config.showClear', e.target.checked)}
        />
      </div>

      {/* Signature preview area */}
      <div style={{
        marginTop: 10,
        border: '1.5px dashed var(--fb-border)',
        borderRadius: 8,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fb-text-muted)',
        fontSize: '0.775rem',
        gap: 6,
        background: '#fafbff',
      }}>
        <i className="pi pi-pen-to-square" />
        Signature canvas will appear here
      </div>
    </>
  );
};

export default SignatureFieldConfig;
