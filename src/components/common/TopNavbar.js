import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from "../../use-firebase.js";
import { useMediaQuery, getSubDomain, getFirstName } from "../../shared-functions.js"
import Logo from "./Logo.js";
import { Navbar, Nav, NavDropdown, Row, Col } from 'react-bootstrap';
// import { List } from "@phosphor-icons/react";
import { ThemeContext } from "../../Theme.js";

export default function TopNavbar(props) {

  const location = useLocation();
  const auth = useAuth();
  let isPageWide = useMediaQuery('(min-width: 600px)');
  const { theme } = useContext(ThemeContext);
  // let subdomain = getSubDomain(window.location.host);

  if (!auth || 
      location.pathname === '/login' ||
      location.pathname === '/signup' ||
      location.pathname === '/onboarding'
    ) {
    return null; 
  }

  return (
    <Row style={{ position: 'fixed', top: 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', height: 40, backgroundColor: `var(--bg-primary)`, marginLeft: 0, marginRight: 0, width: '100%', paddingLeft: 14, paddingRight: 14, zIndex: 100 }}>
      <Logo width={120} />
      { isPageWide && false &&
        <Nav variant='underline' style={{ marginLeft: 20, marginTop: 0 }} className="mr-auto">
          <Nav.Link href="/explore" active={location.pathname === '/explore'}>Explore</Nav.Link>
          <Nav.Link href="/library" active={location.pathname === '/library' || location.pathname.startsWith('/chat')}>Library</Nav.Link>
          <Nav.Link href="/settings" active={location.pathname === '/settings'}>Settings</Nav.Link>
        </Nav>    
      }
    </Row>
  )

}





