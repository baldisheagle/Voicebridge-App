import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Button, DropdownMenu, Heading, Spinner, Table, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbCreateCalendar, dbGetCalendars } from './utilities/database.js';
import { Plus, Stethoscope, GoogleLogo, Calendar } from '@phosphor-icons/react';
import CalendarCard from './components/calendars/CalendarCard.js';
import { v4 as uuidv4 } from 'uuid';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from './use-firebase.js';

export default function Calendars() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    // Get calendars
    dbGetCalendars(auth.workspace.id).then((calendars) => {
      setCalendars(calendars);
    }).catch((error) => {
      console.error("Error getting calendars:", error);
      toast.error("Error getting calendars, please try again");
    });
  }

  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    const provider = new GoogleAuthProvider();
    // Add all required scopes
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');

    // Force consent screen to always appear and request offline access
    provider.setCustomParameters({
      access_type: 'offline',
      prompt: 'consent select_account'
    });

    signInWithPopup(firebaseAuth, provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      // Get refresh token from the user object
      const refreshToken = result.user.refreshToken;

      console.log("Google Calendar connected");
      saveCalendar('Google', 'google', accessToken, refreshToken);
    }).catch((error) => {
      console.error("Error connecting Google Calendar:", error);
      toast.error("Error connecting Google Calendar");
    });
  }

  // Save calendar
  const saveCalendar = async (name, provider, accessToken, refreshToken) => {
    let calendar = {
      id: uuidv4(),
      name: name,
      provider: provider,
      accessToken: accessToken,
      refreshToken: refreshToken, // Store the refresh token
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let result = await dbCreateCalendar(calendar);
    if (result) {
      toast.success('Connected calendar!');
      setCalendars([...calendars, calendar]);
    } else {
      toast.error('Failed to connect calendar');
    }
  }

  // Connect calendar
  const connectCalendar = (provider) => {
    if (provider === 'athena') {
      window.location.href = `https://api.preview.platform.athenahealth.com/oauth2/v1/authorize?response_type=code&client_id=${process.env.REACT_APP_ATHENA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_ATHENA_REDIRECT_URI}&scope=appointments`;
    } else if (provider === 'drchrono') {
      window.location.href = `https://drchrono.com/o/authorize/?redirect_uri=${process.env.REACT_APP_DRCHRONO_REDIRECT_URI}&response_type=code&client_id=${process.env.REACT_APP_DRCHRONO_CLIENT_ID}`;
    } else if (provider === 'epic') {
      window.location.href = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD}&redirect_uri=${process.env.REACT_APP_EPIC_REDIRECT_URI}`;
    } else if (provider === 'google') {
      connectGoogleCalendar();
    }
  }


  if (!auth || !auth.user || loading) {
    return (
      <div style={{ width: '100%', minHeight: '100vh' }}>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
          <Spinner size="2" />
        </Row>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>

      <Heading size='4'>Calendars</Heading>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {calendars.length === 0 ? "No calendars" : `${calendars.length} calendars`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="solid" size="2"><Plus /> Connect</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Group>
                  <DropdownMenu.Label>Calendars</DropdownMenu.Label>
                  <DropdownMenu.Item onClick={() => connectCalendar('google')}><GoogleLogo /> Google Calendar</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('calcom')} disabled><Calendar /> Cal.com</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('calendly')} disabled><Calendar /> Calendly</DropdownMenu.Item>
                </DropdownMenu.Group>
                <DropdownMenu.Separator />
                <DropdownMenu.Group>
                  <DropdownMenu.Label>EHR</DropdownMenu.Label>
                  <DropdownMenu.Item onClick={() => connectCalendar('drchrono')}><Stethoscope /> DrChrono</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('epic')} disabled><Stethoscope /> Epic</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('cerner')} disabled><Stethoscope /> Cerner</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('athena')} disabled><Stethoscope /> Athena Health</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('eclinicalworks')} disabled><Stethoscope /> eClinicalWorks</DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => connectCalendar('nextgen')} disabled><Stethoscope /> NextGen Healthcare</DropdownMenu.Item>
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Col>
        </Row>

        {calendars.length > 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
            {calendars.map((calendar, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4} style={{ padding: 10 }}>
                <CalendarCard auth={auth} calendar={calendar} onDelete={() => {
                  setCalendars(calendars.filter(c => c.id !== calendar.id));
                }} />
              </Col>
            ))}
          </Row>
        )}

        {/* {calendars.length > 0 && (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>

            {calendars.map((calendar, index) => (
              <Table.Row key={index}>
                <Table.Cell>{calendar.name}</Table.Cell>
                <Table.Cell>{calendar.provider}</Table.Cell>
                <Table.Cell><Moment format="DD MMM YYYY">{calendar.createdAt}</Moment></Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }}><Pencil /></Button>
                  <Button variant="ghost" size="3" color="red"><Trash /></Button>
                </Table.Cell>
              </Table.Row>
            ))}
            </Table.Body>
          </Table.Root>
        )} */}

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

