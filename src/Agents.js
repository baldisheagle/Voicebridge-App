import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Text, Heading, Spinner, Card, Badge, Button, Dialog, Switch, IconButton, VisuallyHidden, TextField, Select, TextArea } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { AGENTS } from './config/agents.js';
import { Pencil, Plus } from '@phosphor-icons/react';
import { DEFAULT_PHONE_NUMBERS, LANGUAGES } from './config/lists.js';
import { dbCreateAgent, dbGetAgents, dbUpdateAgent } from './utilities/database.js';
import { v4 as uuidv4 } from 'uuid';
import { formatPhoneNumber } from './helpers/string.js';
export default function Agents() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [agents, setAgents] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState(DEFAULT_PHONE_NUMBERS);
  const [loading, setLoading] = useState(true);
  const [agentNameDialogOpen, setAgentNameDialogOpen] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentId, setAgentId] = useState(null);
  const [agentPhoneNumber, setAgentPhoneNumber] = useState(null);
  const [agentLanguage, setAgentLanguage] = useState(null);
  const [agentDescription, setAgentDescription] = useState(null);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(true);
    dbGetAgents(auth.workspace.id).then((agents) => {
      setAgents(agents);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching agents:", error);
      setLoading(false);
      toast.error('Error fetching agents');
    });
  }

  // Create new agent
  const createNewAgent = (agentId) => {
    console.log('createNewAgent', agentId, auth.workspace.id);
    let _agent = {
      id: uuidv4(),
      agentId: agentId,
      name: AGENTS.find(agent => agent.id === agentId).name,
      mode: AGENTS.find(agent => agent.id === agentId).mode,
      description: AGENTS.find(agent => agent.id === agentId).description,
      enabled: true,
      language: AGENTS.find(agent => agent.id === agentId).attributes.find(attribute => attribute.name === 'language').default,
      phoneNumber: DEFAULT_PHONE_NUMBERS[0].id,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add agent to database
    setLoading(true);
    dbCreateAgent(_agent).then((res) => {
      if (res) {
        _agent.id = res;
        setAgents([...agents, _agent]);
        setLoading(false);
        toast.success('New agent created!');
      } else {
        setLoading(false);
        toast.error('Error creating agent');
      }
    }).catch((error) => {
      console.error("Error adding agent:", error);
      setLoading(false);
      toast.error('Error creating agent');
    });
  }

  // Toggle agent
  const toggleAgent = (agentId, enabled) => {
    let _agent = agents.find(agent => agent.id === agentId);
    _agent.enabled = enabled;
    _agent.updatedAt = new Date().toISOString();
    dbUpdateAgent(_agent).then((res) => {
      if (res) {
        setAgents([...agents]);
        toast.success('Agent updated!');
      } else {
        toast.error('Error updating agent');
      }
    }).catch((error) => {
      console.error("Error updating agent:", error);
      toast.error('Error updating agent');
    });
  }

  // Update agent
  const updateAgent = (agentId) => {
    let _agent = agents.find(agent => agent.id === agentId);
    _agent.name = agentName;
    _agent.phoneNumber = agentPhoneNumber;
    _agent.language = agentLanguage;
    _agent.description = agentDescription;
    _agent.updatedAt = new Date().toISOString();
    dbUpdateAgent(_agent).then((res) => {
      if (res) {
        setAgents(agents.map(agent => agent.id === agentId ? _agent : agent));
        toast.success('Agent updated!');
      } else {
        toast.error('Error updating agent');
      }
    }).catch((error) => {
      console.error("Error updating agent:", error);
      toast.error('Error updating agent');
    });
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
      
      <Heading size='4'>Agents</Heading>
      
      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>  

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {agents.length === 0 ? "No agents" : `${agents.length} agents`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="solid" size="2"><Plus /> New agent</Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ width: '100%' }}>
                <Dialog.Title style={{ marginBottom: 0 }}>New agent</Dialog.Title>
                <Dialog.Description size="2">Select a agent template</Dialog.Description>
                <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                  {AGENTS.length > 0 && AGENTS.map((agent, index) => (
                    <Col key={index} xs={12} sm={12} md={12} lg={6} xl={6} style={{ padding: 5 }}>
                      <Card>
                        {agent.icon}
                        <Heading size="3" as='div' color='gray' style={{ marginTop: 10, marginBottom: 2 }}>{agent.name}</Heading>
                        <Badge size="1" style={{ color: 'var(--gray-11)' }}>{agent.mode}</Badge>
                        <Text size="1" as='div' color='gray' style={{ marginTop: 5 }}>{agent.description}</Text>
                        <Button variant="solid" size="2" style={{ marginTop: 20 }} onClick={() => createNewAgent(agent.id)} disabled={!agent.enabled}>Select</Button>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                  <Dialog.Close>
                    <Button variant="soft" color="gray">Cancel</Button>
                  </Dialog.Close>
                </Row>
              </Dialog.Content>
            </Dialog.Root>
          </Col>
        </Row>


        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          {agents.length > 0 && agents.map((agent, index) => (
            <Col key={index} xs={12} sm={12} md={6} lg={4} xl={4} style={{ padding: 10 }}>
              <Card>
                {/* Agent icon */}
                {AGENTS.find(a => a.id === agent.agentId).icon}
                <Text size="3" as='div' color='gray' style={{ marginTop: 10 }}>{agent.name}</Text>
                <Text size="1" as='div' color='gray' style={{ marginTop: 10 }}>{agent.description}</Text>
                <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                  <Badge size="1" as='div' color='accent' style={{ marginTop: 10 }}>{formatPhoneNumber(phoneNumbers.find(phone => phone.id === agent.phoneNumber).phoneNumber)}</Badge>
                  <Badge size="1" as='div' color='gray' style={{ marginTop: 10 }}>{LANGUAGES.find(language => language.value === agent.language).label}</Badge>
                </Row>
                
                {/* Switch to enable/disable and edit attributes */}
                <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                  <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.id, !agent.enabled)} />
                  <IconButton variant="ghost" size="2" onClick={() => {
                    setAgentId(agent.id);
                    setAgentName(agent.name);
                    setAgentPhoneNumber(agent.phoneNumber);
                    setAgentLanguage(agent.language);
                    setAgentDescription(agent.description);
                    setAgentNameDialogOpen(true);
                  }}><Pencil /></IconButton>
                  <Dialog.Root open={agentNameDialogOpen} onOpenChange={setAgentNameDialogOpen}>
                    <Dialog.Content maxWidth="450px">
                      <Dialog.Title>Edit agent</Dialog.Title>
                      <VisuallyHidden>
                        <Dialog.Description size="2">
                          Edit the agent attributes
                        </Dialog.Description>
                      </VisuallyHidden>

                      {/* Agent name */}
                      <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Name</Text>
                      <TextField.Root variant="outline" value={agentName} onChange={(e) => setAgentName(e.target.value.length > 0 ? e.target.value : 'No name')} />
                      
                      {/* Phone number */}
                      <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Phone number</Text>
                      <Select.Root variant="outline" value={agentPhoneNumber} onValueChange={(value) => setAgentPhoneNumber(value)}>
                        <Select.Trigger placeholder="Select one" style={{ width: '100%' }} />
                        <Select.Content>
                          {phoneNumbers.map((phoneNumber) => (
                            <Select.Item key={phoneNumber.id} value={phoneNumber.id}>{phoneNumber.name}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      
                      {/* Language */}
                      <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Language</Text>
                      <Select.Root variant="outline" value={agentLanguage} onValueChange={(value) => setAgentLanguage(value)}>
                        <Select.Trigger placeholder="Select one" style={{ width: '100%' }} />
                        <Select.Content>
                          {LANGUAGES.map((language, index) => (
                            <Select.Item key={index} value={language.value}>{language.label}</Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>

                      {/* Description */}
                      <Text size="1" as='div' weight="bold" color='gray' style={{ marginTop: 20 }}>Description</Text>
                      <TextArea variant="outline" rows={5} value={agentDescription} onChange={(e) => setAgentDescription(e.target.value.length > 0 ? e.target.value : 'No description')} />
                      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
                        <Button variant="soft" color="gray" onClick={() => setAgentNameDialogOpen(false)}>Cancel</Button>
                        <Button variant="solid" onClick={() => {
                          updateAgent(agentId);
                          setAgentNameDialogOpen(false);
                        }}>Save</Button>
                      </Row>
                    </Dialog.Content>
                  </Dialog.Root>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

      </div>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

