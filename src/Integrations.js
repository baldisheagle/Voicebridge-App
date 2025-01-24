import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";  
import { Button, DropdownMenu, Heading, Spinner, Table, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetIntegrations, dbUpdateIntegration, dbCreateIntegration, dbDeleteIntegration } from './utilities/database.js';
import { Plus, Pencil, Trash, Stethoscope } from '@phosphor-icons/react';
import Moment from 'react-moment';
import { v4 as uuidv4 } from 'uuid';

export default function Integrations() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    // Get integrations
    dbGetIntegrations(auth.workspace.id).then((integrations) => {
      setIntegrations(integrations);
    }).catch((error) => {
      console.error("Error getting integrations:", error);
      toast.error("Error getting integrations, please try again");
    });
  }

  // Delete integration
  const deleteIntegration = async (integrationId) => {
    dbDeleteIntegration(integrationId, auth.workspace.id).then((success) => {
      if (success) {
        toast.success('Integration deleted');
        setIntegrations(integrations.filter(integration => integration.id !== integrationId));
      } else {
        toast.error('Failed to delete integration');
      }
    });
  }

  // Save integration
  const saveIntegration = async (name, provider, accessToken, refreshToken) => {
    let integration = {
      id: uuidv4(),
      name: name,
      provider: provider,
      accessToken: accessToken,
      refreshToken: refreshToken,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let result = await dbCreateIntegration(integration);
    if (result) {
      toast.success('Connected integration!');
      setIntegrations([...integrations, integration]);
    } else {
      toast.error('Failed to connect integration');
    }
  }

  // Update integration name
  const updateIntegration = async (integration) => {
    dbUpdateIntegration(integration).then((success) => {
      if (success) {
        toast.success('Integration updated');
        setIntegrations(integrations.map(integration => integration.id === integration.id ? integration : integration));
      } else {
        toast.error('Failed to update integration');
      }
    });
  }

  const connectIntegration = (provider) => {
    // TODO: Connect integration
    // toast.error("Coming soon");
    if (provider === 'athena') {
      window.location.href = `https://api.preview.platform.athenahealth.com/oauth2/v1/authorize?response_type=code&client_id=${process.env.REACT_APP_ATHENA_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_ATHENA_REDIRECT_URI}&scope=appointments`;
    } else if (provider === 'drchrono') {
      window.location.href = `https://drchrono.com/o/authorize/?redirect_uri=${process.env.REACT_APP_DRCHRONO_REDIRECT_URI}&response_type=code&client_id=${process.env.REACT_APP_DRCHRONO_CLIENT_ID}`;
    } else if (provider === 'epic') {
      window.location.href = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD}&redirect_uri=${process.env.REACT_APP_EPIC_REDIRECT_URI}`;
    }
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

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {integrations.length === 0 ? "No integrations" : `${integrations.length} integrations`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="solid" size="2"><Plus /> Connect</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => connectIntegration('athena')}><Stethoscope /> Athena Health</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('drchrono')}><Stethoscope /> DrChrono</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('epic')}><Stethoscope /> Epic</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('cerner')} disabled><Stethoscope /> Cerner</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('athena')} disabled><Stethoscope /> Athena Health</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('eclinicalworks')} disabled><Stethoscope /> eClinicalWorks</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectIntegration('nextgen')} disabled><Stethoscope /> NextGen Healthcare</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Col>
        </Row>

        {integrations.length > 0 && (
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

            {integrations.map((integration, index) => (
              <Table.Row key={index}>
                <Table.Cell>{integration.name}</Table.Cell>
                <Table.Cell>{integration.provider}</Table.Cell>
                <Table.Cell><Moment format="DD MMM YYYY">{integration.createdAt}</Moment></Table.Cell>
                <Table.Cell>
                  <Button variant="ghost" size="3" color="gray" style={{ marginRight: 5 }}><Pencil /></Button>
                  <Button variant="ghost" size="3" color="red"><Trash /></Button>
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

