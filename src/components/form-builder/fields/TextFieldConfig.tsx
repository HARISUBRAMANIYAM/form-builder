import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { ErrorMessage, Field } from 'formik';
import type { TextAreaConfig, TextConfig } from '../../../types/formBuilder.types';

interface TextFieldConfigProps {
  config: TextConfig | TextAreaConfig;
}

const TextFieldConfig: React.FC<TextFieldConfigProps> = ({ config }) => {
  const isTextArea = config.type === 'TEXTAREA';

  return (
    <>
      <Row className="mb-2">
        <Col>
          <Form.Group controlId="config.maxLength">
            <Form.Label>Max Characters</Form.Label>
            <Field
              name="config.maxLength"
              type="number"
              placeholder={isTextArea ? 'e.g. 2000' : 'e.g. 255'}
              className="form-control"
            />
            <ErrorMessage name="config.maxLength" component="div" className="invalid-feedback d-block" />
          </Form.Group>
        </Col>
      </Row>

      {isTextArea && (
        <Row className="mb-2">
          <Col>
            <Form.Group controlId="config.rows">
              <Form.Label>Rows (Height)</Form.Label>
              <Field
                name="config.rows"
                type="number"
                placeholder="e.g. 4"
                className="form-control"
              />
              <ErrorMessage name="config.rows" component="div" className="invalid-feedback d-block" />
            </Form.Group>
          </Col>
        </Row>
      )}

      {!isTextArea && (
        <Row className="mb-2">
          <Col>
            <Form.Group controlId="config.regex">
              <Form.Label>Regex Pattern <span style={{ color: 'var(--fb-text-muted)', fontWeight: 400 }}>(optional)</span></Form.Label>
              <Field
                name="config.regex"
                type="text"
                placeholder='e.g. ^[A-Za-z]+$'
                className="form-control"
              />
              <small className="text-muted">Custom validation regex pattern</small>
              <ErrorMessage name="config.regex" component="div" className="invalid-feedback d-block" />
            </Form.Group>
          </Col>
        </Row>
      )}
    </>
  );
};

export default TextFieldConfig;
