import { Text } from "@radix-ui/themes";
import React from "react";
// import { useLocation } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';

export default function Footer() {

  // let location = useLocation()

  return (
    <section className="footer-text" style={{ width: '100%', backgroundColor: 'transparent', color: 'var(--text-secondary)', height: 100, padding: 40, textAlign: 'center', marginTop: 20, marginBottom: 40 }}>
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Col style={{ textAlign: 'center' }}>
          <Text size='1' color="gray">Copyright 2024, Comaker Labs.</Text>
        </Col>
      </Row>
    </section>
  )

}
