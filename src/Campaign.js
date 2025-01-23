import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Link, Spinner, Text, TextField, Select, Button, Switch, DropdownMenu, IconButton, Badge } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCampaign, dbUpdateCampaign, dbDeleteCampaign, dbGetPhoneNumbers, dbGetCalendars } from './utilities/database.js';
import { AGENTS } from './config/agents.js';
import { ArrowLeft, Circle, Megaphone, Trash } from '@phosphor-icons/react';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { DEFAULT_PHONE_NUMBERS } from './config/lists.js';

export default function Campaign(props) {

  const auth = useRequireAuth();
  const params = useParams();
  const campaignId = params.campaignId;

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [campaign, setCampaign] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState(DEFAULT_PHONE_NUMBERS);
  const [calendars, setCalendars] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignPhoneNumber, setCampaignPhoneNumber] = useState('');
  const [campaignCalendarId, setCampaignCalendarId] = useState(null);
  const [campaignHoursInAdvance, setCampaignHoursInAdvance] = useState('');
  const [campaignLanguage, setCampaignLanguage] = useState('');
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    setLoading(true);
    // Get campaign
    const _campaign = await dbGetCampaign(campaignId, auth.workspace.id);
    if (_campaign) {
      setLoading(false);
      setCampaign(_campaign);
      setCampaignName(_campaign.name);
      setCampaignPhoneNumber(_campaign.phoneNumber);
      setCampaignCalendarId(_campaign.calendarId);
      setCampaignHoursInAdvance(_campaign.hoursInAdvance);
      // setCampaignTimeOfDay(_campaign.timeOfDay);
      // setCampaignTimezone(_campaign.timezone);
      setCampaignLanguage(_campaign.language);
      setCampaignEnabled(_campaign.enabled);
      // Get phone numbers
      const _phoneNumbers = await dbGetPhoneNumbers(auth.workspace.id);
      setPhoneNumbers(_phoneNumbers.concat(DEFAULT_PHONE_NUMBERS));
      // Get calendars
      const _calendars = await dbGetCalendars(auth.workspace.id);
      setCalendars(_calendars);
    } else {
      setLoading(false);
      navigate('/notfound');
    }
  }

  const saveCampaign = async () => {
    const _campaign = {
      ...campaign,
      name: campaignName,
      phoneNumber: campaignPhoneNumber,
      calendarId: campaignCalendarId,
      hoursInAdvance: campaignHoursInAdvance,
      // timeOfDay: campaignTimeOfDay,
      // timezone: campaignTimezone,
      language: campaignLanguage,
      updatedAt: new Date().toISOString()
    }
    let result = await dbUpdateCampaign(campaignId, auth.workspace.id, _campaign);
    if (result) {
      setCampaign(_campaign);
      toast.success('Campaign updated');
    } else {
      toast.error('Failed to update campaign');
    }
  };

  const deleteCampaign = async () => {
    let result = await dbDeleteCampaign(campaignId, auth.workspace.id);
    if (result) {
      toast.success('Campaign deleted');
      navigate('/campaigns');
    } else {
      toast.error('Failed to delete campaign');
    }
  }

  // Toggle campaign enabled
  const toggleCampaignEnabled = (enabled) => {
    // Check if phone number is set
    if (!campaign.phoneNumber && enabled) {
      toast.error('Set a phone number before setting live');
      return;
    }
    // Check if calendar is set
    if (!campaign.calendarId && enabled) {
      toast.error('Set a calendar before setting live');
      return;
    }
    const _campaign = {
      ...campaign,
      enabled: enabled,
      updatedAt: new Date(),
    }
    dbUpdateCampaign(campaignId, auth.workspace.id, _campaign).then((success) => {
      toast.success("Campaign updated");
      setCampaignEnabled(enabled);
      setCampaign(_campaign);
    }).catch((error) => {
      console.error("Error updating campaign:", error);
      toast.error("Error updating campaign, please try again");
    });
  }

  if (!auth || !auth.user || loading || !campaign) {
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

      <Text size="1" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}><Link style={{ cursor: 'pointer' }} onClick={() => navigate('/campaigns')}><ArrowLeft style={{ marginBottom: 2 }} /> Back to campaigns</Link></Text>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
          {campaign.enabled ? <Badge size="1" color="green"><Circle weight='fill' size={10} color={'var(--green-9)'} />Live</Badge> : <Badge size="1" color="gray"><Circle weight='fill' size={10} color={'var(--gray-9)'} />Paused</Badge>}
        </Row>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 5 }}>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} style={{ padding: 0 }}>
            <TextField.Root variant="soft" style={{ fontSize: 20, backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 }} value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </Col>
          <Col xs={4} sm={4} md={4} lg={4} xl={4} style={{ padding: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
              <Button variant="solid" size="2" onClick={() => saveCampaign()}>{isPageWide ? 'Save changes' : 'Save'}</Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton variant="surface" size='2' color='gray' style={{ marginLeft: 5 }}>
                    <DotsVerticalIcon size='2' />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onClick={() => toggleCampaignEnabled(!campaignEnabled)}><Megaphone />{campaignEnabled ? 'Pause campaign' : 'Start campaign'}</DropdownMenu.Item>
                  <DropdownMenu.Item color="red" style={{ cursor: 'pointer' }} onClick={() => deleteCampaign()}><Trash /> Delete</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Row>
          </Col>
        </Row>

        {/* Agent */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 20, paddingBottom: 5, maxWidth: 500 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Agent</Text>
            <Text size="1" as='div' color='gray'>The agent the campaign uses.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Text size="2" color="gray">{AGENTS[campaign.agentId - 1].name}</Text>
          </Col>
        </Row>

        {/* Phone number */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 20, paddingBottom: 5, maxWidth: 500 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Phone number</Text>
            <Text size="1" as='div' color='gray'>The phone number the agent should send reminders to.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Select.Root variant="outline" value={campaignPhoneNumber} onValueChange={(value) => setCampaignPhoneNumber(value)}>
              <Select.Trigger placeholder="Select one" />
              <Select.Content>
                {phoneNumbers.map((phoneNumber) => (
                  <Select.Item key={phoneNumber.id} value={phoneNumber.id}>{phoneNumber.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Col>
        </Row>

        {/* Calendar */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 20, paddingBottom: 5, maxWidth: 500 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Calendar</Text>
            <Text size="1" as='div' color='gray'>The calendar the agent should send reminders to.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Select.Root variant="outline" value={campaignCalendarId} onValueChange={(value) => setCampaignCalendarId(value)}>
              <Select.Trigger placeholder="Select one" />
              <Select.Content>
                <Select.Item value="none">None</Select.Item>
                {calendars.map((calendar) => (
                  <Select.Item key={calendar.id} value={calendar.id}>{calendar.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Col>
        </Row>

        {/* Hours in advance */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 20, paddingBottom: 5, maxWidth: 500 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Hours in advance</Text>
            <Text size="1" as='div' color='gray'>The number of hours before the appointment the patient should receive this reminder. Enter a value between 1 and 720 (30 days).</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <TextField.Root variant="outline" type='number' min={1} max={720} step={1} style={{ maxWidth: 100 }} value={campaignHoursInAdvance} onChange={(e) => { e.target.value > 720 ? setCampaignHoursInAdvance(720) : e.target.value < 1 ? setCampaignHoursInAdvance(1) : setCampaignHoursInAdvance(parseInt(e.target.value)) }} />
          </Col>
        </Row>

        {/* Language */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 20, paddingBottom: 5, maxWidth: 500 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Language</Text>
            <Text size="1" as='div' color='gray'>The language the agent should send reminders in.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Select.Root variant="outline" value={campaignLanguage} onValueChange={(value) => setCampaignLanguage(value)}>
              <Select.Trigger placeholder="Select a language" />
              <Select.Content>
                {AGENTS[0].attributes.find(attr => attr.name === 'language').options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Col>
        </Row>

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )



}

