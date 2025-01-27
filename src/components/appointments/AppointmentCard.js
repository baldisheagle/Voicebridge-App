import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Text, Badge, Button, Dialog, Select, TextField, IconButton } from '@radix-ui/themes';
import Moment from 'react-moment';
import { CaretCircleDown, CaretCircleUp, CaretDown, CaretUp, Circle, List, Pencil, Play } from '@phosphor-icons/react';
import { APPOINTMENT_TYPES } from '../../config/lists.js';
import { formatPhoneNumber } from '../../helpers/string.js';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { dbCreateTask, dbGetTasksByAppointmentId } from '../../utilities/database.js';

const AppointmentCard = ({
    auth,
    appointment,
    agents,
    onEdit,
    editable
}) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [patientName, setPatientName] = useState(appointment.patient);
    const [phoneNumber, setPhoneNumber] = useState(appointment.phoneNumber);
    const [type, setType] = useState(appointment.appointmentType);
    const [startTime, setStartTime] = useState(appointment.startTime);
    const [newTaskAgent, setNewTaskAgent] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);

    useEffect(() => {
        if (auth && auth.workspace) {
            dbGetTasksByAppointmentId(appointment.id, auth.workspace.id).then((tasks) => {
                setTasks(tasks);
            });
        }
    }, [auth]);

    const handleEdit = () => {
        let _appointment = appointment;
        _appointment.patient = patientName;
        _appointment.phoneNumber = phoneNumber;
        _appointment.appointmentType = type;
        _appointment.startTime = startTime;
        onEdit(_appointment);
    }

    const handleNewTask = async () => {
        let _task = {
            id: uuidv4(),
            appointmentId: appointment.id,
            agentId: newTaskAgent,
            patient: patientName,
            phoneNumber: phoneNumber,
            appointmentType: type,
            status: 'queued',
            workspaceId: auth.workspace.id,
            createdBy: auth.user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        dbCreateTask(_task).then(() => {
            toast.success('Task created');
            setNewTaskDialogOpen(false);
        }).catch((error) => {
            toast.error('Error creating task');
            setNewTaskDialogOpen(false);
        });
    }

    return (
        <Card
            style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: '1px solid var(--gray-6)',
                borderRadius: '8px',
                padding: 15,
                marginBottom: 10,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: 'var(--gray-3)'
                }
            }}
        >
            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0 }}>
                <Col xs={12} md={12} lg={6} style={{ cursor: 'pointer', padding: 0, paddingBottom: 10 }} onClick={() => setIsExpanded(!isExpanded)}>
                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0 }}>
                        <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0 }} onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <CaretUp weight="bold" size={16} /> : <CaretDown weight="bold" size={16} />}</IconButton>
                        {/* Time */}
                        <div style={{ minWidth: '85px', textAlign: 'left', marginLeft: 10 }}>
                            <Text size="3" weight="medium" as='div'>
                                <Moment format="hh:mm A">{appointment.startTime}</Moment>
                            </Text>
                            <Text size="1" color="gray" as='div'>
                                {APPOINTMENT_TYPES.find(type => type.value === appointment.appointmentType)?.label || 'Other'}
                            </Text>
                        </div>

                        {/* Patient Info */}
                        <div style={{ cursor: 'pointer', marginLeft: 20 }} onClick={() => setIsExpanded(!isExpanded)}>
                            <Text size="3" weight="medium" as='div'>
                                {appointment.patient ? appointment.patient : 'No name'}
                            </Text>
                            <Text size="1" color="gray" as='div'>
                                {appointment.phoneNumber ? formatPhoneNumber(appointment.phoneNumber) : 'No number'}
                            </Text>
                        </div>

                    </Row>
                </Col>
                <Col xs={12} md={12} lg={6} style={{ padding: 0 }}>
                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>

                        {editable &&
                            <Dialog.Root>
                                <Dialog.Trigger>
                                    <Button variant="solid" size="1" style={{ marginRight: 5 }}><Pencil /> Edit</Button>
                                </Dialog.Trigger>
                                <Dialog.Content style={{ maxWidth: '450px' }}>

                                    <Dialog.Title>Edit appointment</Dialog.Title>
                                    <Dialog.Description size="2">Update appointment details</Dialog.Description>

                                    {/* Patient name */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Patient name</Text>
                                    <TextField.Root variant="outline" value={patientName} onChange={(e) => setPatientName(e.target.value)} />

                                    {/* Phone number */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Phone number</Text>
                                    <TextField.Root variant="outline" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

                                    {/* Start time */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Start time</Text>
                                    <TextField.Root variant="outline" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />

                                    {/* Appointment type */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Appointment type</Text>
                                    <Select.Root value={type} onValueChange={(value) => setType(value)}>
                                        <Select.Trigger style={{ width: '100%' }} />
                                        <Select.Content>
                                            {APPOINTMENT_TYPES.map((type) => (
                                                <Select.Item key={type.value} value={type.value}>
                                                    {type.label}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Root>

                                    <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                            <Button variant="solid" onClick={handleEdit}>Save changes</Button>
                                        </Dialog.Close>
                                    </Row>

                                </Dialog.Content>
                            </Dialog.Root>
                        }

                        {/* New task */}
                        {editable &&
                            <Dialog.Root open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
                                <Dialog.Trigger>
                                    <Button variant="solid" size="1" style={{ marginRight: 5 }}><Play /> New task</Button>
                                </Dialog.Trigger>
                                <Dialog.Content style={{ maxWidth: '450px' }}>
                                    <Dialog.Title>New task</Dialog.Title>
                                    <Dialog.Description size="2">Create a new task for this appointment</Dialog.Description>

                                    {/* Patient name */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Patient name</Text>
                                    <TextField.Root variant="outline" value={patientName} onChange={(e) => setPatientName(e.target.value)} />

                                    {/* Phone number */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Phone number</Text>
                                    <TextField.Root variant="outline" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />

                                    {/* Appointment type */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Appointment type</Text>
                                    <Text size="2" as='div' weight="medium" color='gray' style={{ marginTop: 5 }}>{APPOINTMENT_TYPES.find(type => type.value === appointment.appointmentType)?.label || 'Other'}</Text>

                                    {/* Agent */}
                                    <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Agent</Text>
                                    <Select.Root value={newTaskAgent} disabled={agents.length === 0} onValueChange={(value) => setNewTaskAgent(value)}>
                                        <Select.Trigger style={{ width: '100%', marginTop: 5 }} />
                                        <Select.Content>
                                            {agents.map((agent) => (
                                                <Select.Item key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Root>

                                    <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 40 }}>
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">Cancel</Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                            <Button variant="solid" onClick={handleNewTask} disabled={!newTaskAgent || !phoneNumber || !patientName}>Create task</Button>
                                        </Dialog.Close>
                                    </Row>

                                </Dialog.Content>
                            </Dialog.Root>
                        }

                        {/* Expand */}
                        {/* <IconButton variant="ghost" size="6" color="gray" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <CaretCircleUp /> : <CaretCircleDown />}</IconButton> */}

                    </Row>
                </Col>
            </Row>

            {/* Expandable Section */}
            <div style={{
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid var(--gray-6)',
                display: isExpanded ? 'block' : 'none',
                maxHeight: 600,
                overflowY: 'auto',
                overflowX: 'hidden'
            }}>
                <Row>
                    <Col xs={12} md={6}>
                        <Text size="1" color="gray" as='div' style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-background)', paddingBottom: '5px' }}>Tasks</Text>
                        <Text size="2" as='div' style={{ marginTop: '5px' }}>
                            {tasks.length > 0 ?
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {tasks.map((task, index) => (
                                        <li key={index} style={{ marginBottom: 15, display: 'flex', alignItems: 'flex-start' }}>
                                            <Circle weight="fill" size={6} color="gray" style={{ marginRight: 8, marginTop: 6 }} />
                                            <div>
                                                <Text size="2" as='div'>{agents.find(agent => agent.id === task.agentId)?.name || 'Unknown'}</Text>
                                                <Text size="1" color="gray" as='div' style={{ marginTop: 5 }}><Moment format="ddd MMM DD, YYYY hh:mm A">{task.createdAt}</Moment></Text>
                                                <Badge variant="soft" color="gray" style={{ marginTop: 5 }}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                : 'No tasks'
                            }
                        </Text>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

export default AppointmentCard; 