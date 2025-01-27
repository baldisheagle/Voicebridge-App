import React, { useEffect, useState } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import { Card, Text, Switch, Spinner, Select, TextField } from '@radix-ui/themes';
import { Calendar } from '@phosphor-icons/react';
import { APPOINTMENT_REMINDER_AGENT } from '../config/agents';
import { dbCreateAgent, dbGetAgents, dbUpdateAgent } from '../utilities/database';
import { useRequireAuth } from '../use-require-auth';
import { DEFAULT_PHONE_NUMBERS, LANGUAGES } from '../config/lists';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
export default function AppointmentReminder() {

    const auth = useRequireAuth();

    const [agent, setAgent] = useState(APPOINTMENT_REMINDER_AGENT);
    const [phoneNumbers, setPhoneNumbers] = useState(DEFAULT_PHONE_NUMBERS);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [agentPhoneNumber, setAgentPhoneNumber] = useState(DEFAULT_PHONE_NUMBERS[0].id);
    const [agentLanguage, setAgentLanguage] = useState('en-US');
    const [agentFirstReminderLeadTime, setAgentFirstReminderLeadTime] = useState(72);
    const [agentSecondReminderLeadTime, setAgentSecondReminderLeadTime] = useState(24);

    // Get agent
    useEffect(() => {
        if (auth && auth.user && auth.workspace) {
            dbGetAgents(auth.workspace.id).then((agents) => {
                let _agent = agents.find(agent => agent.agentId === APPOINTMENT_REMINDER_AGENT.agentId);
                if (_agent) {
                    const mergedAgent = {...APPOINTMENT_REMINDER_AGENT, ..._agent};
                    setAgent(mergedAgent);
                    setAgentPhoneNumber(mergedAgent.phoneNumber);
                    setAgentLanguage(mergedAgent.language);
                    setEnabled(mergedAgent.enabled);
                    setAgentFirstReminderLeadTime(mergedAgent.firstReminderLeadTime);
                    setAgentSecondReminderLeadTime(mergedAgent.secondReminderLeadTime);
                }
                setLoading(false);
            }).catch((error) => {
                console.error('Error fetching agents:', error);
                setLoading(false);
            });
        }
    }, [auth]);

    // Update agent
    const updateAgent = (_agent) => {
        // Second reminder lead time must be less than the first reminder lead time
        if (_agent.secondReminderLeadTime >= _agent.firstReminderLeadTime) {
            toast.error('Second reminder lead time must be less than the first reminder lead time');
            return;
        }
        // Cannot enable the agent if the phone number is not set
        if (!_agent.phoneNumber) {
            toast.error('Phone number is required');
            return;
        }
        // If agent has an id, update it, else create it
        if (_agent.id) {
            dbUpdateAgent(_agent).then((res) => {
                if (res) {
                    toast.success('Agent updated!');
                } else {
                    toast.error('Error updating agent');
                }
            }).catch((error) => {
                console.error('Error updating agent:', error);
                toast.error('Error updating agent');
            });
        } else {
            dbCreateAgent({
                id: uuidv4(),
                agentId: APPOINTMENT_REMINDER_AGENT.agentId,
                name: APPOINTMENT_REMINDER_AGENT.name,
                mode: APPOINTMENT_REMINDER_AGENT.mode,
                enabled: false,
                language: _agent.language || APPOINTMENT_REMINDER_AGENT.attributes.find(attribute => attribute.name === 'language').default,
                phoneNumber: _agent.phoneNumber || DEFAULT_PHONE_NUMBERS[0].id,
                firstReminderLeadTime: _agent.firstReminderLeadTime || 72,
                secondReminderLeadTime: _agent.secondReminderLeadTime || 24,
                workspaceId: auth.workspace.id,
                createdBy: auth.user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).then((res) => {
                if (res) {
                    toast.success('Agent saved!');
                } else {
                    toast.error('Error saving agent');
                }
            }).catch((error) => {
                console.error('Error saving agent:', error);
                toast.error('Error saving agent');
            });
        }
    }

    if (!auth || !auth.user || !auth.workspace || loading) {
        return (
            <div style={{ width: '100%', minHeight: '100vh' }}>
                <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
                    <Spinner size="2" />
                </Row>
            </div>
        )
    }

    return (
        <Card style={{ padding: 10 }}>
            <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 10 }}>
                <Col xs={12} sm={12} md={8} lg={6} xl={4} style={{ padding: 10 }}>
                    <Image src={APPOINTMENT_REMINDER_AGENT.agentPhoto} alt={agent.agentName} width={60} height={60} style={{ borderRadius: '10%', border: '1px solid var(--gray-3)' }} />
                    <Text size="3" as='div' weight="bold" style={{ marginTop: 10 }}>{APPOINTMENT_REMINDER_AGENT.agentName}, {APPOINTMENT_REMINDER_AGENT.name}</Text>
                    <Text size="1" as='div' color='gray' style={{ marginTop: 5 }}>{APPOINTMENT_REMINDER_AGENT.description}</Text>
                    <Switch checked={enabled} style={{ marginTop: 15 }} onCheckedChange={() => {
                            setEnabled(!enabled);
                            updateAgent({ ...agent, enabled: !enabled });
                        }} />
                    <Text size="1" as='div' color='gray' style={{ marginTop: 5 }}>{enabled ? 'Auto-enabled' : 'Disabled'}</Text>
                </Col>
                <Col xs={12} sm={12} md={8} lg={6} xl={6} style={{ padding: 10 }}>
                    {/* Phone number */}
                    <Text size="1" as='div' weight="bold">Phone number</Text>
                    <Text size="1" as='div' color='gray' style={{ marginTop: 2 }}>The phone number the agent should use to send reminders.</Text>
                    <Select.Root variant="outline" value={agentPhoneNumber} onValueChange={(value) => {
                        setAgentPhoneNumber(value);
                        updateAgent({ ...agent, phoneNumber: value });
                    }}>
                        <Select.Trigger variant="surface" color="gray" placeholder="Select one" style={{ width: '100%', marginTop: 10 }} />
                        <Select.Content>
                            {phoneNumbers.map((phoneNumber) => (
                                <Select.Item key={phoneNumber.id} value={phoneNumber.id}>{phoneNumber.name}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>

                    {/* Language */}
                    <Text size="1" as='div' weight="bold" style={{ marginTop: 40 }}>Language</Text>
                    <Text size="1" as='div' color='gray' style={{ marginTop: 2 }}>The language the agent should send reminders in.</Text>
                    <Select.Root variant="outline" value={agentLanguage} onValueChange={(value) => {
                        setAgentLanguage(value);
                        updateAgent({ ...agent, language: value });
                    }}>
                        <Select.Trigger variant="surface" color="gray" placeholder="Select one" style={{ width: '100%', marginTop: 10 }} />
                        <Select.Content>
                            {LANGUAGES.map((language, index) => (
                                <Select.Item key={index} value={language.value}>{language.label}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                    {/* Hours before appointment the first reminder is sent */}
                    <Text size="1" as='div' weight="bold" style={{ marginTop: 40 }}>First reminder lead time</Text>
                    <Text size="1" as='div' color='gray' style={{ marginTop: 2 }}>The agent will send an SMS reminder these many hours before the appointment. Enter a number between 1 and 144 (Default: 72)</Text>
                    <Select.Root variant="outline" value={agentFirstReminderLeadTime} onValueChange={(value) => {
                        setAgentFirstReminderLeadTime(parseInt(value));
                        updateAgent({ ...agent, firstReminderLeadTime: parseInt(value) });
                    }}>
                        <Select.Trigger variant="surface" color="gray" placeholder="Select one" style={{ width: '100%', marginTop: 10 }} />
                        <Select.Content>
                            <Select.Item value={1}>1 hour</Select.Item>
                            <Select.Item value={2}>2 hours</Select.Item>
                            <Select.Item value={6}>6 hours</Select.Item>
                            <Select.Item value={12}>12 hours</Select.Item>
                            <Select.Item value={24}>24 hours (1 day)</Select.Item>
                            <Select.Item value={48}>48 hours (2 days)</Select.Item>
                            <Select.Item value={72}>72 hours (3 days)</Select.Item>
                            <Select.Item value={96}>96 hours (4 days)</Select.Item>
                            <Select.Item value={120}>120 hours (5 days)</Select.Item>
                            <Select.Item value={144}>144 hours (6 days)</Select.Item>
                            <Select.Item value={168}>168 hours (7 days)</Select.Item>
                        </Select.Content>
                    </Select.Root>

                    {/* Hours before appointment the second reminder is sent */}
                    <Text size="1" as='div' weight="bold" style={{ marginTop: 40 }}>Second reminder lead time</Text>
                    <Text size="1" as='div' color='gray' style={{ marginTop: 2 }}>The agent will send an SMS reminder these many hours before the appointment. Enter a number between 1 and 144 (Default: 24)</Text>
                    <Select.Root variant="outline" value={agentSecondReminderLeadTime} onValueChange={(value) => {
                        setAgentSecondReminderLeadTime(parseInt(value));
                        updateAgent({ ...agent, secondReminderLeadTime: parseInt(value) });
                    }}>
                        <Select.Trigger variant="surface" color="gray" placeholder="Select one" style={{ width: '100%', marginTop: 10 }} />
                        <Select.Content>
                            <Select.Item value={1}>1 hour</Select.Item>
                            <Select.Item value={2}>2 hours</Select.Item>
                            <Select.Item value={6}>6 hours</Select.Item>
                            <Select.Item value={12}>12 hours</Select.Item>
                            <Select.Item value={24}>24 hours (1 day)</Select.Item>
                            <Select.Item value={48}>48 hours (2 days)</Select.Item>
                            <Select.Item value={72}>72 hours (3 days)</Select.Item>
                            <Select.Item value={96}>96 hours (4 days)</Select.Item>
                            <Select.Item value={120}>120 hours (5 days)</Select.Item>
                            <Select.Item value={144}>144 hours (6 days)</Select.Item>
                            <Select.Item value={168}>168 hours (7 days)</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Col>
            </Row>

        </Card>
    )
}