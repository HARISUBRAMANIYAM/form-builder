import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';

const PictureFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const isMultiple: boolean = values.config?.multiple ?? false;

  return (
    <>
      <div className="fb-toggle-row">
        <div>
          <div className="fb-toggle-label">Allow Multiple Images</div>
          <div className="fb-toggle-desc">User can upload more than one image</div>
        </div>
        <Form.Check
          type="switch"
          id="config.multiple"
          checked={isMultiple}
          onChange={(e) => {
            setFieldValue('config.multiple', e.target.checked);
            if (!e.target.checked) setFieldValue('config.maxCount', 1);
          }}
        />
      </div>

      {isMultiple && (
        <Row className="mt-2">
          <Col>
            <Form.Group controlId="config.maxCount">
              <Form.Label>Max Images</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                value={values.config?.maxCount ?? 5}
                min={2}
                max={20}
                onChange={(e) => setFieldValue('config.maxCount', parseInt(e.target.value) || 5)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="config.maxSizeMB">
              <Form.Label>Max Size / Image (MB)</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                value={values.config?.maxSizeMB ?? 5}
                min={1}
                max={50}
                onChange={(e) => setFieldValue('config.maxSizeMB', parseFloat(e.target.value) || 5)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isMultiple && (
        <Row className="mt-2">
          <Col>
            <Form.Group controlId="config.maxSizeMB">
              <Form.Label>Max Size (MB)</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                value={values.config?.maxSizeMB ?? 5}
                min={1}
                max={50}
                onChange={(e) => setFieldValue('config.maxSizeMB', parseFloat(e.target.value) || 5)}
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      <div className="fb-divider" />
      <small className="text-muted">
        <i className="pi pi-info-circle me-1" />
        Accepted formats: JPG, PNG, GIF, WEBP, SVG
      </small>
    </>
  );
};

export default PictureFieldConfig;
