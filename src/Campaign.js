import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Link, Spinner, Text, TextField, Select, Button, Switch, DropdownMenu, IconButton } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { dbGetCampaign, dbUpdateCampaign, dbDeleteCampaign, dbGetPhoneNumbers, dbGetCalendars } from './utilities/database.js';
import { AGENTS } from './config/agents.js';
import { ArrowLeft, Circle, Megaphone, Microphone, Trash } from '@phosphor-icons/react';
import { DotsVerticalIcon } from '@radix-ui/react-icons';

export default function Campaign(props) {

  const auth = useRequireAuth();
  const params = useParams();
  const campaignId = params.campaignId;

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [campaign, setCampaign] = useState(null);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignPhoneNumber, setCampaignPhoneNumber] = useState('');
  const [campaignCalendarId, setCampaignCalendarId] = useState(null);
  const [campaignDaysInAdvance, setCampaignDaysInAdvance] = useState('');
  const [campaignTimeOfDay, setCampaignTimeOfDay] = useState('');
  const [campaignTimezone, setCampaignTimezone] = useState('');
  const [campaignLanguage, setCampaignLanguage] = useState('');
  const [campaignEnabled, setCampaignEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(true);
    // Get campaign
    const _campaign = await dbGetCampaign(campaignId, auth.workspace.id); 
    if (_campaign) {
      setLoading(false);
      setCampaign(_campaign);
      setCampaignName(_campaign.name);
      setCampaignPhoneNumber(_campaign.phoneNumber);
      setCampaignCalendarId(_campaign.calendarId);
      setCampaignDaysInAdvance(_campaign.daysInAdvance);
      setCampaignTimeOfDay(_campaign.timeOfDay);
      setCampaignTimezone(_campaign.timezone);
      setCampaignLanguage(_campaign.language);
      setCampaignEnabled(_campaign.enabled);
      // Get phone numbers
      const _phoneNumbers = await dbGetPhoneNumbers(auth.workspace.id);
      setPhoneNumbers(_phoneNumbers);
      // TODO: Get calendars
      const _calendars = await dbGetCalendars(auth.workspace.id);
      setCalendars(_calendars);
    } else {
      setLoading(false);
      navigate('/notfound');
    }
  }

  const saveCampaign = async() => {
    const _campaign = {
      ...campaign,
      name: campaignName,
      phoneNumber: campaignPhoneNumber,
      calendarId: campaignCalendarId,
      daysInAdvance: campaignDaysInAdvance,
      timeOfDay: campaignTimeOfDay,
      timezone: campaignTimezone,
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

  const deleteCampaign = async() => {
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
    // if (!campaign.phoneNumber && enabled) {
    //   toast.error('Set a phone number before setting live');
    //   return;
    // }
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
          <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: campaignEnabled ? 'var(--green-3)' : 'var(--gray-3)', padding: '4px 10px', borderRadius: '9999px', marginLeft: 10 }}>
            <Circle weight='fill' size={12} style={{ marginRight: 5 }} color={campaignEnabled ? 'var(--green-9)' : 'var(--gray-6)'} />
            <Text size="1" style={{ color: campaignEnabled ? 'var(--green-11)' : 'var(--gray-11)' }}>{campaignEnabled ? 'Live' : 'Not running'}</Text>
          </div>
        </Row>

        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 5 }}>
          <Col xs={8} sm={8} md={8} lg={8} xl={8} style={{ padding: 0 }}>
            <TextField.Root variant="soft" style={{ fontSize: 20, backgroundColor: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 }} value={campaign.name} onChange={(e) => setCampaignName(e.target.value)} />
          </Col>
          <Col xs={4} sm={4} md={4} lg={4} xl={4} style={{ padding: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <Row style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
              <Button variant="solid" size="2" onClick={() => saveCampaign()}>{isPageWide ? 'Save changes' : 'Save'}</Button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton size='2' color='gray' style={{ marginLeft: 5 }}>
                    <DotsVerticalIcon size='2' />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item onClick={() => toggleCampaignEnabled(!campaignEnabled)}><Megaphone />{campaignEnabled ? 'Pause campaign' : 'Set campaign live'}</DropdownMenu.Item>
                  <DropdownMenu.Item color="red" style={{ cursor: 'pointer' }} onClick={() => deleteCampaign()}><Trash /> Delete</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Row>
          </Col>
        </Row>

        {/* Phone number */}
        {/* <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Phone number</Text>
            <Text size="1" as='div' color='gray'>The phone number the agent should send reminders to.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Select.Root variant="outline" value={campaignPhoneNumber} onValueChange={(value) => setCampaignPhoneNumber(value)}>
              <Select.Trigger placeholder="Select one" />
              <Select.Content>
                {phoneNumbers.map((phoneNumber) => (
                  <Select.Item key={phoneNumber} value={phoneNumber}>{phoneNumber}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Col>
        </Row> */}

        {/* Calendar */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
            <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Calendar</Text>
            <Text size="1" as='div' color='gray'>The calendar the agent should send reminders to.</Text>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
            <Select.Root variant="outline" value={campaignCalendarId} onValueChange={(value) => setCampaignCalendarId(value)}>
              <Select.Trigger placeholder="Select one" />
              <Select.Content>
                {calendars.map((calendar) => (
                  <Select.Item key={calendar.id} value={calendar.id}>{calendar.name}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Col>
        </Row>

          {/* Number of days */}
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
              <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Days in advance</Text>
              <Text size="1" as='div' color='gray'>The number of days before the appointment the patient should receive a reminder. Enter a value between 1 and 30.</Text>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
              <TextField.Root variant="outline" type='number' min={1} max={30} step={1} style={{ maxWidth: 100 }} value={campaignDaysInAdvance} onChange={(e) => { e.target.value > 30 ? setCampaignDaysInAdvance(30) : e.target.value < 1 ? setCampaignDaysInAdvance(1) : setCampaignDaysInAdvance(parseInt(e.target.value)) }} />
            </Col>
          </Row>

          {/* Time of day */}
          <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
              <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Time of day</Text>
              <Text size="1" as='div' color='gray'>The time of day the agent should send reminders.</Text>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
              <Select.Root variant="outline" value={campaignTimeOfDay} onValueChange={(value) => setCampaignTimeOfDay(value)}>
                <Select.Trigger placeholder="Select a time of day" />
                <Select.Content>
                  {AGENTS[0].attributes.find(attr => attr.name === 'timeOfDay').options.map((option) => (
                    <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
          </Col>
        </Row>
                  
        {/* Timezone */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
              <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Timezone</Text>
              <Text size="1" as='div' color='gray'>The timezone the agent should send reminders in.</Text>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
              <Select.Root variant="outline" value={campaignTimezone} onValueChange={(value) => setCampaignTimezone(value)}>
                <Select.Trigger placeholder="Select a timezone" />
                <Select.Content>
                  {AGENTS[0].attributes.find(attr => attr.name === 'timezone').options.map((option) => (
                    <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
          </Col>
        </Row>

        {/* Language */}
        <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
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

        {/* Status */}
        {/* <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10, paddingRight: 10, paddingBottom: 5 }}>
              <Text size="2" weight="bold" as='div' style={{ color: 'var(--gray-11)' }}>Status</Text>
              <Text size="1" as='div' color='gray'>The status of the campaign.</Text>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={4} style={{ padding: 0, paddingLeft: 10 }}>
              <Switch variant="outline" checked={campaignEnabled} onCheckedChange={(checked) => toggleCampaignEnabled(checked)} />
          </Col>
        </Row> */}

      </div>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

