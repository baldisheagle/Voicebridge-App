import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Table, DropdownMenu, IconButton } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { EyeOpenIcon, TrashIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { greeting } from './utilities/datetime.js'; 
import { TESTING_APPOINTMENTS } from './config/testing.js';
import Moment from 'react-moment';
export default function Appointments() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {

    setLoading(true);

    // Testing
    setAppointments(TESTING_APPOINTMENTS);

    // Get appointments
    // const appointments = await dbGetAppointments(auth.user.id);
    // if (appointments) {
    //   setAppointments(appointments);
    // }

    setLoading(false);
  
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
      
      { isPageWide ? <Heading size='4'>{greeting()}{auth.user.full_name ? ', ' + getFirstName(auth.user.full_name) : ''}</Heading> : <Heading size='4'>Appointments</Heading> }
      
      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>  

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10 }}>

            {appointments.length > 0 ? (
              <Table.Root>
                <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Date & Time</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Patient</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Appointment</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Provider</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Location</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>

                {appointments.map((appointment, index) => (
                  <Table.Row key={index}>
                    <Table.Cell><Moment format="ddd MMM DD, YYYY hh:mm A">{appointment.timestamp}</Moment></Table.Cell>
                    <Table.Cell>{appointment.patient}</Table.Cell>
                    <Table.Cell>{appointment.name}</Table.Cell>
                    <Table.Cell>{appointment.provider}</Table.Cell>
                    <Table.Cell>{appointment.location}</Table.Cell>
                    <Table.Cell justify='end'>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton size='1' variant="ghost" color='gray'>
                            <DotsVerticalIcon size='1' />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                          {/* <DropdownMenu.Item style={{ cursor: 'pointer' }} onClick={() => navigate(`/workflow/${workflow.id}`)}><EyeOpenIcon /> View</DropdownMenu.Item>
                          <DropdownMenu.Item color="red" style={{ cursor: 'pointer' }} onClick={() => trashWorkflow(workflow.id)}><TrashIcon /> Move to trash</DropdownMenu.Item> */}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}

                </Table.Body>
              </Table.Root>
            ) : (
              <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>No appointments</Text>
            )}
          </Col>
        </Row>

      </div>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

