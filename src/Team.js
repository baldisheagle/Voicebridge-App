import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { getFirstName, useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Button, Heading, Spinner, Text } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { Plus } from '@phosphor-icons/react';

export default function Team() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {

  }

  const inviteNewMember = () => {
    // TODO: Invite new member
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
      
      <Heading size='4'>Team</Heading>
      
      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>  

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {teamMembers.length === 0 ? "No members" : `${teamMembers.length} members`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="solid" size="2" onClick={() => inviteNewMember()}><Plus /> Invite member</Button>
          </Col>
        </Row>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

