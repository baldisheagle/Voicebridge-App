import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../use-require-auth.js';
import { useMediaQuery } from '../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../Theme.js";
import { Button, DropdownMenu, Heading, Spinner, AlertDialog, Table, Dialog, VisuallyHidden, TextField, Text, Card, IconButton } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCalendars, dbDeleteCalendar, dbGetCampaigns, dbUpdateCalendarName, dbCreateCalendar } from '../utilities/database.js';
import { GoogleLogo, Plus, Pencil, Trash, Calendar, Stethoscope } from '@phosphor-icons/react';
import Moment from 'react-moment';
import { v4 as uuidv4 } from 'uuid';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../use-firebase.js';

export default function Integrations() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calendars, setCalendars] = useState([]);
  const [ehr, setEhr] = useState([]);
  const [calendarNameDialogOpen, setCalendarNameDialogOpen] = useState(false);
  const [calendarId, setCalendarId] = useState(null);
  const [calendarName, setCalendarName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    // TODO: Get calendars
    dbGetCalendars(auth.workspace.id).then((calendars) => {
      setCalendars(calendars);
    }).catch((error) => {
      console.error("Error getting calendars:", error);
      toast.error("Error getting calendars, please try again");
    });
  }

  // Delete calendar
  const deleteCalendar = async (calendarId) => {
    // TODO: Make sure the calendar is not in use by a campaign
    dbGetCampaigns(auth.workspace.id).then((campaigns) => {
      if (campaigns.some(campaign => campaign.calendarId === calendarId)) {
        toast.error("Calendar is in use by a campaign");
        return;
      } else {
        dbDeleteCalendar(calendarId, auth.workspace.id).then((success) => {
          if (success) {
            toast.success("Calendar deleted");
            setCalendars(calendars.filter(calendar => calendar.id !== calendarId));
          } else {
            toast.error("Error deleting calendar, please try again");
          }
        });
      }
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

  // Update calendar name
  const updateCalendarName = async (calendarId, name) => {
    dbUpdateCalendarName(calendarId, name.trim(), auth.workspace.id).then((success) => {
      if (success) {
        toast.success('Calendar name updated');
        setCalendars(calendars.map(calendar => calendar.id === calendarId ? { ...calendar, name: name.trim() } : calendar));
        setCalendarNameDialogOpen(false);
      } else {
        toast.error('Failed to update calendar name');
      }
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
  
  const connectCalendar = (provider) => {
    // TODO: Connect calendar
    toast.error("Coming soon");
  }

  // Connect calendly
  // const connectCalendly = () => {
  //   // TODO: Switch to production credentials
  //   const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${process.env.REACT_APP_CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_CALENDLY_REDIRECT_URI_SANDBOX}`;
  //   window.location.href = authUrl;
  // }

  const connectEHR = (system) => {
    // TODO: Connect EHR
    toast.error("Coming soon");
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

      <Heading size='4'>Integrations</Heading>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        {/* Calendars */}
        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Text size='3' as='div' style={{ marginRight: 10, marginBottom: 0 }}>{calendars.length} connected</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid" size="2"><Plus /> Connect</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Label>Calendars</DropdownMenu.Label>
                <DropdownMenu.Item onClick={() => connectGoogleCalendar()}><GoogleLogo /> Google Calendar</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectCalendar('calcom')} disabled><Calendar /> Cal.com</DropdownMenu.Item>
                {/* <DropdownMenu.Item onClick={() => connectCalendly()}>Calendly</DropdownMenu.Item> */}
              </DropdownMenu.Group>
              <DropdownMenu.Group>  
                <DropdownMenu.Label>EHR</DropdownMenu.Label>
                <DropdownMenu.Item onClick={() => connectEHR('epic')} disabled><Stethoscope /> Epic</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectEHR('cerner')} disabled><Stethoscope /> Cerner</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectEHR('athena')} disabled><Stethoscope /> Athena Health</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectEHR('eclinicalworks')} disabled><Stethoscope /> eClinicalWorks</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectEHR('nextgen')} disabled><Stethoscope /> NextGen Healthcare</DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Row>

        {/* Calendars */}
        {calendars.length > 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'stretch', marginLeft: 0, marginRight: 0, marginTop: 20, marginBottom: 20 }}>
            {calendars.map((calendar, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={4} style={{ padding: 10 }}>
                <Card>
                  {calendar.provider === 'google' && <GoogleLogo size={24} />}
                  <Text size="3" as="div" weight="bold" style={{ marginTop: 20 }}>{calendar.name}</Text>
                  <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
                    {/* Edit calendar */}
                    <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }} onClick={() => { setCalendarId(calendar.id); setCalendarName(calendar.name); setCalendarNameDialogOpen(true); }}><Pencil /></Button>
                    <Dialog.Root open={calendarNameDialogOpen} onOpenChange={setCalendarNameDialogOpen}>
                      <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Edit name</Dialog.Title>
                        <VisuallyHidden>
                          <Dialog.Description size="2">
                            Edit the name of the calendar
                          </Dialog.Description>
                        </VisuallyHidden>
                        <TextField.Root variant="outline" value={calendarName} onChange={(e) => setCalendarName(e.target.value.length > 0 ? e.target.value : 'No name')} />
                        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                          <Button variant="solid" color="gray" onClick={() => console.log('cancel')}>Cancel</Button>
                          <Button variant="solid" onClick={() => {
                            updateCalendarName(calendarId, calendarName);
                            setCalendarNameDialogOpen(false);
                          }}>Save</Button>
                        </Row>
                      </Dialog.Content>
                    </Dialog.Root>
                    {/* Delete calendar */}
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
                            <Button variant="solid" color="gray">
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
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Calendars */}
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
                  <Table.Cell>{calendar.name}</Table.Cell>
                  <Table.Cell>{calendar.provider}</Table.Cell>
                  <Table.Cell><Moment format="DD MMM YYYY">{calendar.createdAt}</Moment></Table.Cell>
                  <Table.Cell>
                    {/* Edit calendar */}
                    <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }} onClick={() => { setCalendarId(calendar.id); setCalendarName(calendar.name); setCalendarNameDialogOpen(true); }}><Pencil /></Button>
                    <Dialog.Root open={calendarNameDialogOpen} onOpenChange={setCalendarNameDialogOpen}>
                      <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Edit name</Dialog.Title>
                        <VisuallyHidden>
                          <Dialog.Description size="2">
                            Edit the name of the calendar
                          </Dialog.Description>
                        </VisuallyHidden>
                        <TextField.Root variant="outline" value={calendarName} onChange={(e) => setCalendarName(e.target.value.length > 0 ? e.target.value : 'No name')} />
                        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                          <Button variant="solid" color="gray">Cancel</Button>
                          <Button variant="solid" onClick={() => {
                            updateCalendarName(calendarId, calendarName);
                            setCalendarNameDialogOpen(false);
                          }}>Save</Button>
                        </Row>
                      </Dialog.Content>
                    </Dialog.Root>
                    {/* Delete calendar */}
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
                            <Button variant="solid" color="gray">
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

        {/* EHR */}
        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
          <Heading size='3' as='div' style={{ marginRight: 10, marginBottom: 0, marginRight: 20 }}>EHR</Heading>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid" size="2"><Plus /> Connect</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => connectEHR('epic')} disabled><Stethoscope /> Epic</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => connectEHR('cerner')} disabled><Stethoscope /> Cerner</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => connectEHR('athena')} disabled><Stethoscope /> Athena Health</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => connectEHR('eclinicalworks')} disabled><Stethoscope /> eClinicalWorks</DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => connectEHR('nextgen')} disabled><Stethoscope /> NextGen Healthcare</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Row>

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

            {ehr.map((ehr, index) => (
              <Table.Row key={index}>
                <Table.Cell>{ehr.name}</Table.Cell>
                <Table.Cell>{ehr.provider}</Table.Cell>
                <Table.Cell><Moment format="DD MMM YYYY">{ehr.createdAt}</Moment></Table.Cell>
                <Table.Cell>

                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

