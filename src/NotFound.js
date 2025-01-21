import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Heading, Button } from '@radix-ui/themes';

export default function NotFound() {

  const navigate = useNavigate();

  return (
    <Row style={{ justifyContent: 'center' }}>
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Col xs={9} sm={7} md={5} lg={5} xl={4} style={{ textAlign: 'center' }}>
          <Heading size="3">Page not found</Heading>
          <Button variant="soft" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Back to home</Button>
        </Col>
      </Row>
    </Row>
  )

}
