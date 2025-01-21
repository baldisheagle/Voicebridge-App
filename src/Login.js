import React, { useState, useEffect } from 'react';
import { useAuth } from "./use-firebase.js";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from './shared-functions.js';
import Footer from "./components/common/Footer.js";
import Logo from "./components/common/Logo.js";
import { Row, Col, Image, Spinner } from "react-bootstrap";
import { Button } from "@radix-ui/themes";
import toast from 'react-hot-toast';
export default function Login(props) {

  const auth = useAuth();
  const navigate = useNavigate();

  let isPageWide = useMediaQuery('(min-width: 960px)');

  useEffect(() => {
    if (auth.user) {
      navigate('/campaigns');
    }
    window.scrollTo(0,0);
  }, [auth]);

  const handleGoogleLogin = () => {
    if (auth.googleLogin()) {
      navigate('/campaigns');
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (auth && auth.authenticating) {
    return (
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: isPageWide ? -200 : -55, marginRight: 0, height: '80vh' }}>
        <Col style={{ textAlign: 'center' }}>
          <p className="small muted">Authenticating .. hold on a sec</p>
          <Spinner animation="border" role="status" style={{ marginTop: 20 }} />
        </Col>
      </Row>
    )
  }

  return (
    <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', marginLeft: isPageWide ? -200 : -55 }}>
      <Col xs={12} sm={12} md={8} lg={6} xl={5} style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Logo width={140} />
        </div>
        <div style={{ width: '100%', textAlign: 'center', marginTop: 40 }}>
          <Button variant='soft' color='gray' size='3' onClick={() => handleGoogleLogin()}><Image src={"/assets/buttons/google_icon.png"} style={{ width: 20, marginRight: 12 }} />Continue with Google</Button>
        </div>
        <Footer />
      </Col>
      {/* <Col xs={12} sm={12} md={12} lg={6} xl={7} style={{ padding: 0, height: '100vh' }}>
        <div class="pattern_auth" style={{ height: '100%' }}></div>
      </Col> */}
    </Row>
  );
}
