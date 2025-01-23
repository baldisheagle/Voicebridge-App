import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { AlertDialog, Badge, Button, DropdownMenu, Spinner, Table, Text } from '@radix-ui/themes';
import { dbGetPhoneNumbers } from '../../utilities/database.js';
import { Plus, Trash } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
import { DEFAULT_PHONE_NUMBERS } from '../../config/lists.js';
import { formatPhoneNumber } from '../../helpers/string.js';

export default function PhoneNumbers() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [phoneNumbers, setPhoneNumbers] = useState(DEFAULT_PHONE_NUMBERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    // Get phone numbers
    dbGetPhoneNumbers(auth.workspace.id).then((phoneNumbers) => {
      setPhoneNumbers(phoneNumbers.concat(DEFAULT_PHONE_NUMBERS));
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

      {/* Phone numbers table */}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Phone number</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>

          {phoneNumbers.map((phoneNumber, index) => (
            <Table.Row key={index}>
              <Table.Cell>{phoneNumber.name}</Table.Cell>
              <Table.Cell>{phoneNumber.type}</Table.Cell>
              <Table.Cell><Text size="2" color="var(--accent-9)">{formatPhoneNumber(phoneNumber.phoneNumber, 'US')}</Text></Table.Cell>
              <Table.Cell>
                <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, minWidth: 60 }}>
                  { phoneNumber.type === 'default' ? null : (
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button variant="ghost" size="3" color="red"><Trash /></Button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Content maxWidth="450px">
                      <AlertDialog.Title>Delete {phoneNumber.name}</AlertDialog.Title>
                      <AlertDialog.Description size="2">
                        Are you sure you want to delete this phone number?
                      </AlertDialog.Description>
                    </AlertDialog.Content>
                    </AlertDialog.Root>
                  )}
                </Row>
              </Table.Cell>
            </Table.Row>
          ))}

        </Table.Body>
      </Table.Root>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

