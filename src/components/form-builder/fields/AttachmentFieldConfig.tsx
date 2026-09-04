import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const COMMON_MIME_TYPES = [
  { label: 'PDF', value: 'pdf' },
  { label: 'Word (.docx)', value: 'docx' },
  { label: 'Word (.doc)', value: 'doc' },
  { label: 'Excel (.xlsx)', value: 'xlsx' },
  { label: 'Excel (.xls)', value: 'xls' },
  { label: 'PowerPoint', value: 'pptx' },
  { label: 'Text (.txt)', value: 'txt' },
  { label: 'CSV', value: 'csv' },
  { label: 'ZIP', value: 'zip' },
];

const AttachmentFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const allowedTypes: string[] = values.config?.allowedTypes ?? [];

  const toggleType = (val: string) => {
    const next = allowedTypes.includes(val)
      ? allowedTypes.filter((t) => t !== val)
      : [...allowedTypes, val];
    setFieldValue('config.allowedTypes', next);
  };

  return (
    <>
      <div className="fb-properties__section-title">
        <i className="pi pi-file" /> Allowed File Types
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {COMMON_MIME_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => toggleType(t.value)}
            style={{
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: '0.72rem',
              fontWeight: 500,
              border: '1.5px solid',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              borderColor: allowedTypes.includes(t.value) ? 'var(--fb-primary)' : 'var(--fb-border)',
              background: allowedTypes.includes(t.value) ? 'var(--fb-primary-ghost)' : 'transparent',
              color: allowedTypes.includes(t.value) ? 'var(--fb-primary)' : 'var(--fb-text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {allowedTypes.includes(t.value) && <i className="pi pi-check" style={{ fontSize: 9, marginRight: 3 }} />}
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ marginBottom: 10 }}>
        <Form.Group controlId="config.customTypes">
          <Form.Label style={{ fontSize: '0.75rem' }}>Custom Types (comma-separated)</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            placeholder="e.g. svg, mp4"
            value={(values.config?.allowedTypes ?? []).filter((t: string) => !COMMON_MIME_TYPES.map(m => m.value).includes(t)).join(', ')}
            onChange={(e) => {
              const customs = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
              const commons = allowedTypes.filter((t) => COMMON_MIME_TYPES.map(m => m.value).includes(t));
              setFieldValue('config.allowedTypes', [...commons, ...customs]);
            }}
          />
        </Form.Group>
      </div>
      <Row>
        <Col>
          <Form.Group controlId="config.maxSizeMB">
            <Form.Label>Max File Size (MB)</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              value={values.config?.maxSizeMB ?? 10}
              min={1}
              max={100}
              onChange={(e) => setFieldValue('config.maxSizeMB', parseFloat(e.target.value) || 10)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="config.maxFiles">
            <Form.Label>Max Files</Form.Label>
            <Form.Control
              size="sm"
              type="number"
              value={values.config?.maxFiles ?? 1}
              min={1}
              max={20}
              onChange={(e) => setFieldValue('config.maxFiles', parseInt(e.target.value) || 1)}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default AttachmentFieldConfig;
