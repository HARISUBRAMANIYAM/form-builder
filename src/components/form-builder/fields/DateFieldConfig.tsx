import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { FieldType } from '../../../types/formBuilder.types';

const DateFieldConfig: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const fieldType: FieldType = values.fieldType;

  if (fieldType === FieldType.DATE) {
    return (
      <>
        <Row className="mb-2">
          <Col>
            <Form.Group controlId="config.quickDefault">
              <Form.Label>Quick Default</Form.Label>
              <Form.Select
                value={values.config?.quickDefault ?? ''}
                onChange={(e) => setFieldValue('config.quickDefault', e.target.value)}
                size="sm"
              >
                <option value="">Custom / No default</option>
                <option value="CURRENTDATE">Current Date</option>
              </Form.Select>
              <small className="text-muted">Pre-fill with today's date when the form opens</small>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-2">
          <Col xs={6}>
            <Form.Group controlId="config.minDate">
              <Form.Label>Min Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={values.config?.minDate ?? ''}
                onChange={(e) => setFieldValue('config.minDate', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={6}>
            <Form.Group controlId="config.maxDate">
              <Form.Label>Max Date</Form.Label>
              <Form.Control
                type="date"
                size="sm"
                value={values.config?.maxDate ?? ''}
                onChange={(e) => setFieldValue('config.maxDate', e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </>
    );
  }

  if (fieldType === FieldType.DATETIME) {
    return (
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.quickDefault">
            <Form.Label>Quick Default</Form.Label>
            <Form.Select
              value={values.config?.quickDefault ?? ''}
              onChange={(e) => setFieldValue('config.quickDefault', e.target.value)}
            >
              <option value="">Custom / No default</option>
              <option value="CURRENTDATETIME">Current Date &amp; Time</option>
            </Form.Select>
            <small className="text-muted">Pre-fill with current date &amp; time when the form opens</small>
          </Form.Group>
        </Col>
      </Row>
    );
  }

  if (fieldType === FieldType.TIME) {
    return (
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.quickDefault">
            <Form.Label>Quick Default</Form.Label>
            <Form.Select
              value={values.config?.quickDefault ?? ''}
              onChange={(e) => setFieldValue('config.quickDefault', e.target.value)}
            >
              <option value="">Custom / No default</option>
              <option value="CURRENTTIME">Current Time</option>
            </Form.Select>
            <small className="text-muted">Pre-fill with the current time when the form opens</small>
          </Form.Group>
        </Col>
      </Row>
    );
  }

  return null;
};

export default DateFieldConfig;
