import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const SYSTEM_ATTRS = [
  { label: 'Employee ID', value: 'employeeId' },
  { label: 'Employee Name', value: 'employeeName' },
  { label: 'Department', value: 'department' },
  { label: 'Designation', value: 'designation' },
  { label: 'Email Address', value: 'email' },
  { label: 'Manager Name', value: 'managerName' },
  { label: 'Date of Joining', value: 'dateOfJoining' },
  { label: 'Location / Branch', value: 'location' },
  { label: 'Cost Center', value: 'costCenter' },
  { label: 'Grade / Band', value: 'grade' },
  { label: 'Employment Type', value: 'employmentType' },
  { label: 'Current Date', value: 'currentDate' },
  { label: 'Current User', value: 'currentUser' },
];

const SystemAttributeFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.attributeKey">
            <Form.Label>
              System Attribute <span style={{ color: 'var(--fb-danger)' }}>*</span>
            </Form.Label>
            <Form.Select
              size="sm"
              value={values.config?.attributeKey ?? ''}
              onChange={(e) => setFieldValue('config.attributeKey', e.target.value)}
            >
              <option value="">— Select Attribute —</option>
              {SYSTEM_ATTRS.map((attr) => (
                <option key={attr.value} value={attr.value}>{attr.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {values.config?.attributeKey && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--fb-success-light)',
          borderRadius: 8,
          fontSize: '0.775rem',
          color: '#065f46',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}>
          <i className="pi pi-check-circle" />
          Will auto-populate: <strong>{SYSTEM_ATTRS.find(a => a.value === values.config?.attributeKey)?.label}</strong>
        </div>
      )}

      <div className="fb-divider" />

      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Allow Override</div>
          <div className="fb-toggle-desc">User can edit the pre-filled value</div>
        </div>
        <Form.Check
          type="switch"
          id="config.allowOverride"
          checked={values.config?.allowOverride ?? false}
          onChange={(e) => setFieldValue('config.allowOverride', e.target.checked)}
        />
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--fb-text-muted)', display: 'flex', gap: 6, marginTop: 4 }}>
        <i className="pi pi-database" style={{ flexShrink: 0 }} />
        <span>Value is automatically mapped from the system. No user input required by default.</span>
      </div>
    </>
  );
};

export default SystemAttributeFieldConfig;
