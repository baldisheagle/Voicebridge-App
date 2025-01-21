import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Heading, Spinner, Text } from '@radix-ui/themes';
import { dbGetPhoneNumbers } from '../../utilities/database.js';
import { Plus } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
export default function PhoneNumbers() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    // Get phone numbers
    dbGetPhoneNumbers(auth.workspace.id).then((phoneNumbers) => {
      setPhoneNumbers(phoneNumbers);
    }).catch((error) => {
      console.error("Error getting phone numbers:", error);
      toast.error("Error getting phone numbers, please try again");
    });
  }

  const buyNewNumber = () => {
    // TODO: Connect new number using Twilio or Retell API
  }

  const connectExistingNumber = () => {
    // TODO: Connect existing number using Twilio or Retell API
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
    <div style={{ width: '100%' }}>
      
      <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {phoneNumbers.length === 0 ? "No phone numbers" : `${phoneNumbers.length} phone numbers`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>  
                <Button variant="solid" size="2"><Plus /> New number</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => buyNewNumber()}>Buy new number</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => connectExistingNumber()}>Connect existing number</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
          </Col>
        </Row>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

