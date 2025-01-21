import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Spinner, Table, Text, AlertDialog } from '@radix-ui/themes';
import { dbGetCalendars, dbDeleteCalendar, dbGetCampaigns, dbCreateCalendar } from '../../utilities/database.js';
import { Plus, Trash } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
import Moment from 'react-moment';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../../use-firebase.js';
import { v4 as uuidv4 } from 'uuid';
export default function Calendars() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(true);
    // Get calendars
    dbGetCalendars(auth.workspace.id).then((calendars) => {
      setCalendars(calendars);
      setLoading(false);
    }).catch((error) => {
      console.error("Error getting calendars:", error);
      toast.error("Error getting calendars, please try again");
      setLoading(false);
    });
  }

  // Delete calendar
  const deleteCalendar = async(calendarId) => {
    // TODO: Make sure the calendar is not in use by a campaign
    dbGetCampaigns(auth.workspace.id).then((campaigns) => {
      if (campaigns.some(campaign => campaign.calendarId === calendarId)) {
        toast.error("Calendar is in use by a campaign");
        return;
      } else {
        dbDeleteCalendar(calendarId, auth.workspace.id).then((success) => {
          if (success) {
            toast.success("Calendar deleted");
            // Refresh calendars
            setCalendars(calendars.filter(calendar => calendar.id !== calendarId));
          } else {
            toast.error("Error deleting calendar, please try again");
          }
        });
      }
    });
  }

  // Connect calendly
  const connectCalendly = () => {
    // TODO: Switch to production credentials
    const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${process.env.REACT_APP_CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_CALENDLY_REDIRECT_URI_SANDBOX}`;
    window.location.href = authUrl;
  }

  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    const provider = new GoogleAuthProvider();
    // Add all required scopes
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
    
    signInWithPopup(firebaseAuth, provider).then((result) => {
      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken; // This is the token we need
      
      console.log("Google Calendar connected");
      // getCalendarEvents(accessToken);
      saveCalendar('Google', 'google', accessToken);
    }).catch((error) => {
      console.error("Error connecting Google Calendar:", error);
      toast.error("Error connecting Google Calendar");
    });
  }

  // Save calendar
  const saveCalendar = async(name, provider, accessToken) => {
    let calendar = {
      id: uuidv4(),
      name: name,
      provider: provider,
      accessToken: accessToken,
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

  // const getCalendarEvents = async (accessToken) => {
  //   console.log("Get calendar events");
    
  //   const calendarId = 'primary';
  //   const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
    
  //   const params = new URLSearchParams({
  //     timeMin: new Date().toISOString(),
  //     singleEvents: 'true',
  //     orderBy: 'startTime',
  //     maxResults: '10'
  //   });

  //   try {
  //     const response = await fetch(`${url}?${params}`, {
  //       headers: {
  //         'Authorization': `Bearer ${accessToken}`,
  //         'Accept': 'application/json'
  //       }
  //     });
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  
  //     const data = await response.json();
  //     console.log('Events:', data.items);
  //     // Handle events data
  //   } catch (error) {
  //     console.error('Error fetching events:', error);
  //   }
  // };
  
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
    <div style={{ width: '100%' }}>

      {/* <Button variant="solid" size="2" onClick={() => getCalendlyEvents()}>Get Events</Button> */}
      
      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {calendars.length === 0 ? "No calendars" : `${calendars.length} calendars`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>  
                <Button variant="solid" size="2"><Plus /> New calendar</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => connectCalendly()}>Calendly</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectGoogleCalendar()}>Google Calendar</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Col>
        </Row>

        {calendars.length > 0 && (
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
                  <Table.Cell><Text size="3" weight="medium" as='div'>{calendar.name}</Text></Table.Cell>
                  <Table.Cell>{calendar.provider}</Table.Cell>
                  <Table.Cell><Moment format="DD MMM YYYY">{calendar.createdAt}</Moment></Table.Cell>
                  <Table.Cell align='center'>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button variant="ghost" size="3" color="red"><Trash /></Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete {calendar.name}</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          Are you sure you want to delete this calendar?
                        </AlertDialog.Description>

                        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                          <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">
                              Cancel
                            </Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button variant="solid" color="red" onClick={() => deleteCalendar(calendar.id)}>
                              Delete
                            </Button>
                          </AlertDialog.Action>
                        </Row>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </Table.Cell>
                </Table.Row>
              ))}

            </Table.Body>
          </Table.Root>
        )}

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

