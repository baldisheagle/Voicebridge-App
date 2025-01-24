import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Dialog, Button, TextField, Select, TabNav } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { greeting } from './utilities/datetime.js';
import Moment from 'react-moment';
import { Plus } from '@phosphor-icons/react';
import { APPOINTMENT_TYPES } from './config/lists.js';
import { dbUpdateAppointment, dbGetAppointments, dbGetAgents, dbCreateAppointment, dbGetTasks } from './utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import AppointmentCard from './components/AppointmentCard';

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

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

      <TabNav.Root defaultValue="upcoming">
        <TabNav.Link 
          value="upcoming"
          active={activeTab === 'upcoming'} 
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </TabNav.Link>
        <TabNav.Link 
          value="past"
          active={activeTab === 'past'} 
          onClick={() => setActiveTab('past')}
        >
          Past
        </TabNav.Link>
      </TabNav.Root>


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
                    
                    {dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleAppointmentEdit}
                        agents={agents}
                        auth={auth}
                        editable={true}
                      />
                    ))}
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
                    
                    {dayAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={handleAppointmentEdit}
                        agents={agents}
                        auth={auth}
                        editable={false}
                      />
                    ))}
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

