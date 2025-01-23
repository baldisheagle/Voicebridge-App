import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row, Tab } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Badge, Button, Heading, IconButton, Link, Select, Spinner, Table, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCampaigns, dbGetLogs } from './utilities/database.js';
import { AGENTS } from './config/agents.js';
import Moment from 'react-moment';
import { formatPhoneNumber } from './helpers/string.js';
import { ArrowClockwise, Phone } from '@phosphor-icons/react';

export default function Logs() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [logs, setLogs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('recent');

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(true);
    // Get logs 
    let _logs = await dbGetLogs(auth.workspace.id);
    setLogs(_logs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    // Get campaigns
    let _campaigns = await dbGetCampaigns(auth.workspace.id);
    setCampaigns(_campaigns);
    setLoading(false);
  }

  const refreshLogs = async() => {
    setLoading(true);
    let _logs = await dbGetLogs(auth.workspace.id);
    if (sortFilter === 'recent') {
      setLogs(_logs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } else if (sortFilter === 'oldest') {
      setLogs(_logs.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)));
    }
    setLoading(false);
  }

  const sortLogs = (sortFilter) => {
    if (sortFilter === 'recent') {
      setLogs(logs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
    } else if (sortFilter === 'oldest') {
      setLogs(logs.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)));
    }
    return;
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
      
      <Heading size='4'>Logs</Heading>
      
      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col xs={8} sm={8} md={6} lg={6} xl={6} style={{ padding: 5 }}>
            <Select.Root size="2" defaultValue="all" onValueChange={(value) => setStatusFilter(value)}>
              <Select.Trigger placeholder="Filter by status" />
              <Select.Content>
                <Select.Group>
                  <Select.Item value="all">All statuses</Select.Item>
                  <Select.Item value="scheduled">Scheduled</Select.Item>
                  <Select.Item value="in_progress">In progress</Select.Item>
                  <Select.Item value="missed">Missed</Select.Item>
                  <Select.Item value="answered">Answered</Select.Item>
                  <Select.Item value="completed">Completed</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
            <Select.Root size="2" defaultValue="recent" onValueChange={(value) => { setSortFilter(value); sortLogs(value); }}>
              <Select.Trigger placeholder="Sort" style={{ marginLeft: 10 }}  />
              <Select.Content>
                <Select.Item value="recent">Sort by recent</Select.Item>
                <Select.Item value="oldest">Sort by oldest</Select.Item>
              </Select.Content>
            </Select.Root>
          </Col>
          <Col xs={4} sm={4} md={6} lg={6} xl={6} style={{ padding: 5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outline" color="gray" size="2" onClick={refreshLogs}><ArrowClockwise size={16} /> {isPageWide ? 'Refresh' : ''}</Button>
          </Col>
        </Row>

        {logs.length === 0 && (
          <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col>
              <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
                No logs
              </Text>
            </Col>
          </Row>
        )}

        {logs.length > 0 && (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Event</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>To</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Campaign</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Last updated</Table.ColumnHeaderCell>
                {/* <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell> */}
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {logs.filter(log => statusFilter === 'all' || log.status === statusFilter).map((log, index) => (
                <Table.Row key={index}>
                  <Table.Cell style={{ width: 18 }}>
                    {log.type === 'phone' ? <Phone size={16} /> : ''}
                  </Table.Cell>
                  <Table.Cell>
                    {log.appointment.summary || 'Unknown'}
                  </Table.Cell>
                  <Table.Cell>
                    {log.toPhoneNumber ? formatPhoneNumber(log.toPhoneNumber, 'US') : 'Unknown'}
                  </Table.Cell>
                  <Table.Cell>
                    <Link onClick={() => navigate(`/campaign/${log.campaignId}`)} style={{ cursor: 'pointer' }}>{campaigns.find(campaign => campaign.id === log.campaignId).name || log.campaignId}</Link>
                    {/* <Text size="1" color="gray" as='div'>{AGENTS[log.agentId - 1].name || log.agentId}</Text> */}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={log.status === 'scheduled' ? 'gray' : log.status === 'in_progress' ? 'yellow' : log.status === 'missed' ? 'red' : log.status === 'answered' ? 'green' : log.status === 'completed' ? 'green' : 'gray'}>{log.status.charAt(0).toUpperCase() + log.status.slice(1)}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="1" color="gray" as='div'>
                      <Moment format="DD MMM YYYY HH:mm">{new Date(log.updatedAt)}</Moment>
                    </Text>
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

