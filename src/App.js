import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import "./App.css";

import { useMediaQuery } from './shared-functions.js';

import { Theme } from "@radix-ui/themes";
import { ThemeContext } from "./Theme.js";
import { Container, Row, Col } from 'react-bootstrap';
import { ProvideAuth } from "./use-firebase.js";
import Login from "./Login.js";

import NotFound from "./NotFound.js";
import Campaigns from "./Campaigns.js";
import Campaign from "./Campaign.js";
import Tasks from "./Tasks.js";
import AllAgents from "./AllAgents.js";
import Team from "./Team.js";
import Settings from './Settings.js';
import Appointments from './Appointments.js';
import Calendars from './Calendars.js';
import Profile from './components/common/Profile.js';
import SidebarComponent from './components/common/Sidebar.js';
import CalendlyConnect from './callbacks/CalendlyCallback.js';
import AthenaConnect from './callbacks/AthenaCallback.js';
import DrChronoConnect from './callbacks/DrChronoCallback.js';
import EpicConnect from './callbacks/EpicCallback.js';

export default function App() {

  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');
  
  document.body.style = 'background: var(--accent-1)';

  return (
    <ProvideAuth>
      <Router>
        <Theme accentColor="orange" appearance={theme === 'dark-theme' ? "dark" : "light"}>
          <Container className={`App ${theme}`} fluid style={{ marginTop: 0, padding: 0, backgroundColor: `var(--accent-1)` }}>
            <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginTop: 0, marginLeft: 0, marginRight: 0 }}>
              <SidebarComponent />
              <Profile />
              <Col style={{ width: `calc(100% - ${isPageWide ? 200 : 45}px)`, padding: 0, marginTop: 0, marginLeft: isPageWide ? 200 : 45, minHeight: '100vh' }}>
                <Routes>
                  {/* Main */}
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/calendars" element={<Calendars />} />
                  <Route path="/agents" element={<AllAgents />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaign/:campaignId" element={<Campaign />} />
                  {/* <Route path="/logs" element={<Logs />} /> */}
                  <Route path="/team" element={<Team />} />
                  <Route path="/tasks" element={<Tasks />} />
                  {/* Integrations */}
                  <Route path="/callbacks/athena" element={<AthenaConnect />} />
                  <Route path="/callbacks/drchrono" element={<DrChronoConnect />} />
                  <Route path="/callbacks/epic" element={<EpicConnect />} />
                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />
                  {/* Calendly */}
                  <Route path="/calendly_connect" element={<CalendlyConnect />} />
                  {/* Catch all */}
                  <Route path="/notfound" element={<NotFound />} />
                  <Route path="/" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Col>
            </Row>
          </Container>
        </Theme>
      </Router>
    </ProvideAuth>
  );

}
