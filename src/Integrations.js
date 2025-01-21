import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Button, DropdownMenu, Heading, Spinner, Text, AlertDialog, Table, Dialog, VisuallyHidden } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCalendars, dbDeleteCalendar, dbGetCampaigns } from './utilities/database.js';
import { Calendar, Plus, Pencil, Trash } from '@phosphor-icons/react';
import Moment from 'react-moment';
export default function Integrations() {

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
  const initialize = async() => {
    // TODO: Get calendars
    dbGetCalendars(auth.workspace.id).then((calendars) => {
      setCalendars(calendars);
    }).catch((error) => {
      console.error("Error getting calendars:", error);
      toast.error("Error getting calendars, please try again");
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
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Heading size='3' as='div' style={{ marginRight: 10, marginBottom: 0 }}>Calendars</Heading>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="solid" size="1"><Plus /></Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => connectCalendly()}><Calendar size={15} weight="bold" /> Calendly</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Row>

        {/* Calendars */}
        {calendars.length > 0 && (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {calendars.map((calendar, index) => (
                <Table.Row key={index}>
                  <Table.Cell><Text size="3" weight="medium" as='div'>{calendar.name}</Text></Table.Cell>
                  <Table.Cell>{calendar.type}</Table.Cell>
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

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

