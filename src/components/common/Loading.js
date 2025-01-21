import React from 'react'
import { Container, Row, Col, Spinner } from 'react-bootstrap'

export default function Loading() {
  return (
    <div style={{ marginTop: '40%', marginLeft: '50%' }}>
      <Spinner animation="border" />
    </div>
  );
}
