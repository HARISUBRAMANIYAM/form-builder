import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const ScaleFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const min: number = values.config?.min ?? 1;
  const max: number = values.config?.max ?? 10;

  return (
    <>
      <Row className="mb-2">
        <Col xs={6}>
          <Form.Group controlId="config.min">
            <Form.Label>Min Value</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              value={min}
              onChange={(e) => setFieldValue('config.min', parseInt(e.target.value) || 0)}
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group controlId="config.max">
            <Form.Label>Max Value</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              value={max}
              onChange={(e) => setFieldValue('config.max', parseInt(e.target.value) || 10)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Scale step */}
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.step">
            <Form.Label>Step</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              value={values.config?.step ?? 1}
              min={0.1}
              step={0.1}
              onChange={(e) => setFieldValue('config.step', parseFloat(e.target.value) || 1)}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="fb-divider" />

      {/* End labels */}
      <div className="fb-properties__section-title">
        <i className="pi pi-tag" /> End Labels
      </div>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.labels.min">
            <Form.Label>Min Label</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="e.g. Low / Strongly Disagree"
              value={values.config?.labels?.min ?? ''}
              onChange={(e) => setFieldValue('config.labels', { ...values.config?.labels, min: e.target.value })}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="config.labels.max">
            <Form.Label>Max Label</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder="e.g. High / Strongly Agree"
              value={values.config?.labels?.max ?? ''}
              onChange={(e) => setFieldValue('config.labels', { ...values.config?.labels, max: e.target.value })}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Live preview */}
      <div style={{
        padding: '12px 0 4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)' }}>{values.config?.labels?.min || min}</span>
        <div style={{
          flex: 1,
          height: 4,
          background: 'linear-gradient(to right, var(--fb-primary), var(--fb-primary-light))',
          borderRadius: 99,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--fb-primary)',
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--fb-text-muted)' }}>{values.config?.labels?.max || max}</span>
      </div>
      <small className="text-muted">Scale preview (slider)</small>
    </>
  );
};

export default ScaleFieldConfig;
