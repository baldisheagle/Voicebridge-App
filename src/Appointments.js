import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Dialog, Button, TextField, Select, Table, IconButton, Badge, TabNav } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import Moment from 'react-moment';
import { Plus, CaretUp, CaretDown, Circle } from '@phosphor-icons/react';
import { APPOINTMENT_TYPES } from './config/lists.js';
import { dbUpdateAppointment, dbGetAppointments, dbGetAgents, dbCreateAppointment, dbGetTasks, dbGetLogs } from './utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import AppointmentCard from './components/appointments/AppointmentCard.js';

export default function Appointments() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [appointments, setAppointments] = useState([]);
  const [appointmentsPast, setAppointmentsPast] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const [appointmentPatient, setAppointmentPatient] = useState('');
  const [appointmentPhoneNumber, setAppointmentPhoneNumber] = useState('');
  const [appointmentAppointmentType, setAppointmentAppointmentType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString());
  const [newTaskAgent, setNewTaskAgent] = useState(false);
  const [newAppointmentDialogOpen, setNewAppointmentDialogOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {

    setLoading(true);

    // Get appointments
    const appointments = await dbGetAppointments(auth.workspace.id);
    if (appointments) {
      // Appointments in the future only
      setAppointments(appointments.filter(appointment => new Date(appointment.startTime) > new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
      // Appointments in the past only
      setAppointmentsPast(appointments.filter(appointment => new Date(appointment.startTime) < new Date()).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
    }

    // Get agents
    const agents = await dbGetAgents(auth.workspace.id);
    if (agents) {
      setAgents(agents);
    }

    setLoading(false);

  }

  const handleAppointmentEdit = async (_appointment) => {
    dbUpdateAppointment(_appointment).then(() => {
      // Update the appointment in the state
      setAppointments(appointments.map(appointment => appointment.id === _appointment.id ? _appointment : appointment));
      toast.success('Appointment updated');
    }).catch((error) => {
      toast.error('Error updating appointment');
    });

  }

  const handleNewAppointment = async () => {
    let _appointment = {
      id: uuidv4(),
      patient: appointmentPatient,
      phoneNumber: appointmentPhoneNumber,
      appointmentType: appointmentAppointmentType,
      startTime: appointmentDate,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    dbCreateAppointment(_appointment).then(() => {
      toast.success('Appointment created');
      setAppointments([_appointment, ...appointments].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
      setNewAppointmentDialogOpen(false);
    }).catch((error) => {
      toast.error('Error creating appointment');
      setNewAppointmentDialogOpen(false);
    });
  }

  const handleNewTask = async () => {
    console.log('New task', newTaskAgent, appointmentPatient, appointmentPhoneNumber, appointmentAppointmentType);
  }

  // Add this helper function at the top of the component
  const groupAppointmentsByDay = (appointments) => {
    return appointments.reduce((groups, appointment) => {
      const date = new Date(appointment.startTime).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  };

  const toggleRow = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

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

      <Heading size='4'>Appointments</Heading>

      <div style={{ width: '100%', marginTop: 20 }}>
          <TabNav.Root>
            <TabNav.Link href="#" active={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')}>
              Upcoming
            </TabNav.Link>
            <TabNav.Link href="#" active={activeTab === 'past'} onClick={() => setActiveTab('past')}>
              Past
            </TabNav.Link>
          </TabNav.Root>
        </div>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {activeTab === 'upcoming' ? (appointments.length === 0 ? "No appointments" : `${appointments.length} appointments`) : (appointmentsPast.length === 0 ? "No appointments" : `${appointmentsPast.length} appointments`)}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {activeTab === 'upcoming' && (
              <Dialog.Root open={newAppointmentDialogOpen} onOpenChange={setNewAppointmentDialogOpen}>
                <Dialog.Trigger>
                  <Button variant="solid"><Plus /> New</Button>
                </Dialog.Trigger>
                <Dialog.Content style={{ maxWidth: '450px' }}>
                  <Dialog.Title>New appointment</Dialog.Title>
                  <Dialog.Description size="2">Create a new appointment</Dialog.Description>

                  {/* Patient name */}
                  <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Patient name</Text>
                  <TextField.Root variant="outline" value={appointmentPatient} onChange={(e) => setAppointmentPatient(e.target.value)} />

                  {/* Date and time */}
                  <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Date and time</Text>
                  <TextField.Root variant="outline" type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />

                  {/* Phone number */}
                  <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Phone number</Text>
                  <TextField.Root variant="outline" value={appointmentPhoneNumber} onChange={(e) => setAppointmentPhoneNumber(e.target.value)} />

                  {/* Appointment type */}
                  <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Appointment type</Text>
                  <Select.Root value={appointmentAppointmentType} onValueChange={(value) => setAppointmentAppointmentType(value)}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {APPOINTMENT_TYPES.map((type) => (
                        <Select.Item key={type.value} value={type.value}>{type.label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>

                  <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                    <Dialog.Close>
                      <Button variant="solid" color="gray">Cancel</Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button variant="solid" onClick={handleNewAppointment}>Create appointment</Button>
                    </Dialog.Close>
                  </Row>

                </Dialog.Content>
              </Dialog.Root>
            )}
          </Col>
        </Row>

        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
          <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10 }}>

            {activeTab === 'upcoming' && appointments.length > 0 && (
              <div>
                {Object.entries(groupAppointmentsByDay(appointments)).map(([date, dayAppointments]) => (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginBottom: 10, marginTop: 20 }}>
                      <Moment format="dddd, MMMM D, YYYY">{new Date(date)}</Moment>
                    </Text>

                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Patient</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Phone Number</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Appointment Type</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {dayAppointments.map((appointment, index) => (
                          <React.Fragment key={appointment.id}>
                            <Table.Row
                              onClick={() => toggleRow(appointment.id)}
                              style={{ cursor: 'pointer', backgroundColor: expandedRows.has(index) ? 'var(--gray-2)' : 'transparent' }}
                            >
                              <Table.Cell minWidth="100px">  
                                <Text size="2" weight="medium" as='div'>
                                  <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0, marginRight: 5 }}>
                                    {expandedRows.has(index) ?
                                      <CaretUp weight="bold" size={12} />
                                      :
                                      <CaretDown weight="bold" size={12} />
                                    }
                                  </IconButton>
                                  <Moment format="hh:mm A">{appointment.startTime}</Moment>
                                </Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Text size="2" weight="medium" as='div'>{appointment.patient}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Text size="2" color="gray" as='div'>{appointment.phoneNumber}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Badge size="2" weight="medium" color='gray' as='div'>{APPOINTMENT_TYPES.find(type => type.value === appointment.appointmentType)?.label || 'Other'}</Badge>
                              </Table.Cell>
                            </Table.Row>
                            {/* Expandable section */}
                            {expandedRows.has(appointment.id) && (
                              <Table.Row>
                                <Table.Cell colSpan="2" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                  <Text size="1" color="gray" as='div' style={{ position: 'sticky', top: 0, paddingBottom: '5px' }}>Logs</Text>
                                  <Text size="2" as='div' style={{ marginTop: '5px' }}>
                                    {logs.length > 0 ?
                                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {logs.map((log, index) => (
                                          <li key={index} style={{ marginBottom: 15, display: 'flex', alignItems: 'flex-start' }}>
                                            <Circle weight="fill" size={6} color="gray" style={{ marginRight: 8, marginTop: 6 }} />
                                            <div>
                                              <Text size="2" as='div'>{agents.find(agent => agent.id === log.agentId)?.name || 'Unknown'}</Text>
                                              <Text size="1" color="gray" as='div' style={{ marginTop: 5 }}><Moment format="ddd MMM DD, YYYY hh:mm A">{log.createdAt}</Moment></Text>
                                              <Badge variant="soft" color="gray" style={{ marginTop: 5 }}>{log.status.charAt(0).toUpperCase() + log.status.slice(1)}</Badge>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                      : 'No logs'
                                    }
                                  </Text>
                                </Table.Cell>
                                <Table.Cell colSpan="3" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </React.Fragment>
                        ))}
                      </Table.Body>
                    </Table.Root>

                    {/* {dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleAppointmentEdit}
                        agents={agents}
                        auth={auth}
                        editable={true}
                      />
                    ))} */}

                  </div>
                ))}
              </div>
            )}

            {activeTab === 'past' && appointmentsPast.length > 0 && (
              <div>
                {Object.entries(groupAppointmentsByDay(appointmentsPast)).map(([date, dayAppointments]) => (
                  <div key={date} style={{ marginBottom: 20 }}>
                    <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-12)', marginBottom: 10, marginTop: 20 }}>
                      <Moment format="dddd, MMMM D, YYYY">{new Date(date)}</Moment>
                    </Text>

                    <Table.Root>
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeaderCell>Time</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Patient</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Phone Number</Table.ColumnHeaderCell>
                          <Table.ColumnHeaderCell>Appointment Type</Table.ColumnHeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {dayAppointments.map((appointment, index) => (
                          <React.Fragment key={appointment.id}>
                            <Table.Row
                              onClick={() => toggleRow(appointment.id)}
                              style={{ cursor: 'pointer', backgroundColor: expandedRows.has(index) ? 'var(--gray-2)' : 'transparent' }}
                            >
                              <Table.Cell minWidth="160px">
                                <Text size="2" weight="medium" as='div'>
                                  <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0, marginRight: 5 }}>
                                    {expandedRows.has(index) ?
                                      <CaretUp weight="bold" size={12} />
                                      :
                                      <CaretDown weight="bold" size={12} />
                                    }
                                  </IconButton>
                                  <Moment format="hh:mm A">{appointment.startTime}</Moment>
                                </Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Text size="2" weight="medium" as='div'>{appointment.patient}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Text size="2" color="gray" as='div'>{appointment.phoneNumber}</Text>
                              </Table.Cell>
                              <Table.Cell minWidth="120px">
                                <Badge size="2" weight="medium" color='gray' as='div'>{APPOINTMENT_TYPES.find(type => type.value === appointment.appointmentType)?.label || 'Other'}</Badge>
                              </Table.Cell>
                            </Table.Row>
                            {/* Expandable section */}
                            {expandedRows.has(appointment.id) && (
                              <Table.Row>
                                <Table.Cell colSpan="2" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                  <Text size="1" color="gray" as='div' style={{ position: 'sticky', top: 0, paddingBottom: '5px' }}>Logs</Text>
                                  <Text size="2" as='div' style={{ marginTop: '5px' }}>
                                    {logs.length > 0 ?
                                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {logs.map((log, index) => (
                                          <li key={index} style={{ marginBottom: 15, display: 'flex', alignItems: 'flex-start' }}>
                                            <Circle weight="fill" size={6} color="gray" style={{ marginRight: 8, marginTop: 6 }} />
                                            <div>
                                              <Text size="2" as='div'>{agents.find(agent => agent.id === log.agentId)?.name || 'Unknown'}</Text>
                                              <Text size="1" color="gray" as='div' style={{ marginTop: 5 }}><Moment format="ddd MMM DD, YYYY hh:mm A">{log.createdAt}</Moment></Text>
                                              <Badge variant="soft" color="gray" style={{ marginTop: 5 }}>{log.status.charAt(0).toUpperCase() + log.status.slice(1)}</Badge>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                      : 'No logs'
                                    }
                                  </Text>
                                </Table.Cell>
                                <Table.Cell colSpan="3" style={{ padding: '16px', backgroundColor: 'var(--gray-1)' }}>
                                </Table.Cell>
                              </Table.Row>
                            )}
                          </React.Fragment>
                        ))}
                      </Table.Body>
                    </Table.Root>


                    {/* {dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleAppointmentEdit}
                        agents={agents}
                        auth={auth}
                        editable={false}
                      />
                    ))} */}

                  </div>
                ))}
              </div>
            )}

          </Col>
        </Row>

      </div>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

