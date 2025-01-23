import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Row, Col } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Heading, Spinner, Text, Badge, Table, IconButton } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetTasks, dbGetAgents } from './utilities/database.js';
import Moment from 'react-moment';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
export default function Tasks() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    // Get tasks
    let _tasks = await dbGetTasks(auth.workspace.id);
    setTasks(_tasks);
    // Get agents
    let _agents = await dbGetAgents(auth.workspace.id);
    setAgents(_agents);
    setLoading(false);
  }

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

      <Heading size='4'>Tasks</Heading>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>

              {tasks.length === 0 ? "No tasks" : `${tasks.length} tasks`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>

          </Col>
        </Row>

        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Date & Time</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Patient</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Phone Number</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Agent</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tasks.map((task, index) => (
              <React.Fragment key={index}>
                <Table.Row 
                  onClick={() => toggleRow(index)}
                  style={{ cursor: 'pointer', backgroundColor: expandedRows.has(index) ? 'var(--gray-2)' : 'transparent' }}
                >
                  <Table.Cell minWidth="160px">
                    <Text size="2" weight="medium" as='div'>
                      <IconButton variant="ghost" size="1" color="gray" style={{ marginTop: 0, marginRight: 5 }}>
                        { expandedRows.has(index) ?
                          <CaretUp weight="bold" size={12} />
                          :
                          <CaretDown weight="bold" size={12} />
                        }
                      </IconButton>
                      <Moment format="ddd MMM DD, YYYY hh:mm A">{task.createdAt}</Moment>
                    </Text>
                  </Table.Cell>
                  <Table.Cell minWidth="120px"> 
                    <Text size="2" weight="medium" as='div'>{task.patient}</Text>
                  </Table.Cell>
                  <Table.Cell minWidth="120px">
                    <Text size="2" color="gray" as='div'>{task.phoneNumber}</Text>
                  </Table.Cell>
                  <Table.Cell minWidth="120px">
                    <Badge size="2" weight="medium" color='gray' as='div'>{agents.find(agent => agent.id === task.agentId)?.name || 'Unknown'}</Badge>
                  </Table.Cell>
                  <Table.Cell minWidth="120px">
                    <Badge size="2" variant="soft">{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</Badge>
                  </Table.Cell>
                </Table.Row>
                {expandedRows.has(index) && (
                  <Table.Row>
                    <Table.Cell colSpan="2" style={{ padding: '16px', backgroundColor: 'var(--gray-2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Text size="2" weight="bold">Task details</Text>
                        <Text size="1" as='div' color="gray">Task ID: {task.id}</Text>
                        <Text size="1" as='div' color="gray">Created: <Moment format="MMMM DD, YYYY hh:mm A">{task.createdAt}</Moment></Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell colSpan="3" style={{ padding: '16px', backgroundColor: 'var(--gray-2)' }}>
                      <Text size="2" weight="bold">Logs</Text>
                      {/* Insert task logs here */}
                    </Table.Cell>

                  </Table.Row>
                )}
              </React.Fragment>
            ))}
          </Table.Body>
        </Table.Root>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

