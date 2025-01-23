import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from './use-require-auth.js';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "./Theme.js";
import { Button, Heading, Spinner, Text, TextField, VisuallyHidden, Dialog, Switch, Card, AlertDialog, Select, Table, Link, Badge } from '@radix-ui/themes';
import toast, { Toaster } from 'react-hot-toast';
import { Circle, Pencil, Plus, Trash } from '@phosphor-icons/react';
import { AGENTS } from './config/agents.js';
import { v4 as uuidv4 } from 'uuid';
import { dbGetCampaigns, dbCreateCampaign, dbUpdateCampaign, dbDeleteCampaign, dbGetCalendars } from './utilities/database.js';
import Moment from 'react-moment';
import { DEFAULT_PHONE_NUMBERS } from './config/lists.js';
import { formatPhoneNumber } from './helpers/string.js';

export default function Campaigns() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [campaigns, setCampaigns] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState(DEFAULT_PHONE_NUMBERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async () => {
    // Get campaigns
    dbGetCampaigns(auth.workspace.id).then((_campaigns) => {
      setCampaigns(_campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching campaigns:", error);
      setLoading(false);
    });
    // Get calendars
    dbGetCalendars(auth.workspace.id).then((_calendars) => {
      setCalendars(_calendars);
    }).catch((error) => {
      console.error("Error fetching calendars:", error);
    });
  }

  // Create new campaign
  const createNewCampaign = () => {
    let id = uuidv4();
    let _campaign = {
      id: id,
      name: '3-day reminder',
      agentId: 1,
      hoursInAdvance: AGENTS[0].attributes.find(attr => attr.name === 'hoursInAdvance').default,
      // timeOfDay: AGENTS[0].attributes.find(attr => attr.name === 'timeOfDay').default,
      // timezone: AGENTS[0].attributes.find(attr => attr.name === 'timezone').default,
      language: AGENTS[0].attributes.find(attr => attr.name === 'language').default,
      phoneNumber: DEFAULT_PHONE_NUMBERS[0].id,
      calendarId: '',
      enabled: false,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dbCreateCampaign(_campaign).then(() => {
      navigate(`/campaign/${id}`);
    }).catch((error) => {
      console.error("Error creating campaign:", error);
      toast.error("Error creating campaign, please try again");
    });
  }

  // Delete campaign
  const deleteCampaign = (campaignId) => {
    dbDeleteCampaign(campaignId, auth.workspace.id).then((success) => {
      setCampaigns(campaigns.filter((campaign) => campaign.id !== campaignId));
      toast.success("Campaign deleted");
    }).catch((error) => {
      console.error("Error deleting campaign:", error);
      toast.error("Error deleting campaign, please try again");
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

      <Heading size='4'>Campaigns</Heading>

      <div style={{ position: 'relative', top: 10, width: '100%', paddingRight: 10, overflow: 'auto', height: 'calc(100vh - 40px)' }}>
        
        <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0 }}>
          <Col>
            <Text size="2" weight="medium" as='div' style={{ color: 'var(--gray-11)' }}>
              {campaigns.length === 0 ? "No campaigns" : `${campaigns.length} campaigns`}
            </Text>
          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Dialog.Root>
              <Dialog.Trigger>
                <Button variant="solid" size="2"><Plus /> New campaign</Button>
              </Dialog.Trigger>
              <Dialog.Content style={{ width: '100%' }}>
                <Dialog.Title style={{ marginBottom: 0 }}>New campaign</Dialog.Title>
                <Dialog.Description size="2">Select an agent to run the new campaign</Dialog.Description>
                <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                  {AGENTS.length > 0 && AGENTS.map((agent, index) => (
                    <Col key={index} xs={12} sm={12} md={12} lg={6} xl={6} style={{ padding: 5 }}>
                      <Card>
                        {agent.icon}
                        <Heading size="3" as='div' color='gray' style={{ marginTop: 10, marginBottom: 2 }}>{agent.name}</Heading>
                        <Badge size="1" style={{ color: 'var(--gray-11)' }}>{agent.mode}</Badge>
                        <Text size="1" as='div' color='gray' style={{ marginTop: 5 }}>{agent.description}</Text>
                        <Button variant="solid" size="2" style={{ marginTop: 20 }} onClick={() => createNewCampaign(agent.id)} disabled={!agent.enabled}>Select</Button>
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

        {/* Campaigns table */}
        {campaigns.length > 0 && (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Agent</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Phone number</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Calendar</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>

              {campaigns.map((campaign, index) => (
                <Table.Row key={index}>
                  <Table.Cell>
                    <Link style={{ cursor: 'pointer' }} onClick={() => navigate(`/campaign/${campaign.id}`)}>{campaign.name}</Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" color="gray">{AGENTS[campaign.agentId - 1].name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {phoneNumbers.find((phoneNumber) => phoneNumber.id === campaign.phoneNumber)?.phoneNumber ? 
                      <Text size="2" color="var(--accent-9)">{formatPhoneNumber(phoneNumbers.find((phoneNumber) => phoneNumber.id === campaign.phoneNumber)?.phoneNumber, 'US')}</Text>
                    : 
                      <Text size="2" color="gray">Not set</Text>
                    }
                  </Table.Cell>
                  <Table.Cell>
                    {campaign.calendarId ? calendars.find((calendar) => calendar.id === campaign.calendarId)?.name || 'Not set' : 'Not set'}
                    </Table.Cell>
                  <Table.Cell><Moment format="DD MMM YYYY">{campaign.createdAt.toDate()}</Moment></Table.Cell>
                  <Table.Cell>
                    {campaign.enabled ? <Badge size="2" color="green"><Circle weight='fill' size={10} color={'var(--green-9)'} />Live</Badge> : <Badge size="2" color="gray"><Circle weight='fill' size={10} color={'var(--gray-9)'} />Paused</Badge>}
                  </Table.Cell>
                  <Table.Cell>
                    <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, minWidth: 60 }}>
                      <Button variant="ghost" size="3" style={{ marginRight: 5 }} onClick={() => navigate(`/campaign/${campaign.id}`)}><Pencil /></Button>
                      <AlertDialog.Root>
                        <AlertDialog.Trigger>
                          <Button variant="ghost" size="3" color="red"><Trash /></Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Content maxWidth="450px">
                          <AlertDialog.Title>Delete {campaign.name}</AlertDialog.Title>
                          <AlertDialog.Description size="2">
                            Are you sure you want to delete this campaign?
                          </AlertDialog.Description>

                          <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
                            <AlertDialog.Cancel>
                              <Button variant="soft" color="gray">
                                Cancel
                              </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                              <Button variant="solid" color="red" onClick={() => deleteCampaign(campaign.id)}>
                                Delete
                              </Button>
                            </AlertDialog.Action>
                          </Row>
                        </AlertDialog.Content>
                      </AlertDialog.Root>
                    </Row>
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


// // Save new campaign
// const saveNewCampaign = () => {
//   // Save campaign to database
//   const campaign = {
//     id: uuidv4(),
//     name: campaignName,
//     agentId: 1,
//     daysInAdvance: parseInt(campaignDaysInAdvance) < AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').min ? AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').min : parseInt(campaignDaysInAdvance) > AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').max ? AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').max : parseInt(campaignDaysInAdvance),
//     timeOfDay: campaignTimeOfDay,
//     timezone: campaignTimezone,
//     language: campaignLanguage,
//     phoneNumber: campaignPhoneNumber,
//     enabled: campaignEnabled,
//     workspaceId: auth.workspace.id,
//     createdBy: auth.user.uid,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   }

//   dbCreateCampaign(campaign).then((campaignId) => {
//     setCampaigns([...campaigns, { id: campaignId, ...campaign }]);
//     setCampaignName('');
//     setCampaignDaysInAdvance('');
//     setCampaignTimeOfDay('');
//     setCampaignTimezone('');
//     setCampaignLanguage('');
//     setCampaignPhoneNumber('');
//     setCampaignEnabled(true);
//     setShowNewCampaignModal(false);
//     toast.success("Campaign created");
//   }).catch((error) => {
//     console.error("Error saving campaign:", error);
//     toast.error("Error saving campaign, please try again");
//   });
// };
// // Save campaign edits
// const saveCampaignEdits = () => {
//   const campaign = campaigns.find((campaign) => campaign.id === campaignId);
//   const _campaign = {
//     ...campaign,
//     name: campaignName,
//     daysInAdvance: parseInt(campaignDaysInAdvance) < AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').min ? AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').min : parseInt(campaignDaysInAdvance) > AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').max ? AGENTS[0].attributes.find(attr => attr.name === 'daysInAdvance').max : parseInt(campaignDaysInAdvance),
//     timeOfDay: campaignTimeOfDay,
//     timezone: campaignTimezone,
//     language: campaignLanguage,
//     phoneNumber: campaignPhoneNumber,
//     enabled: campaignEnabled,
//     updatedAt: new Date(),
//   }
//   // Get campaign document
//   dbUpdateCampaign(campaignId, auth.workspace.id, _campaign).then((success) => {  
//     if (success) {
//       setCampaigns(campaigns.map((campaign) => campaign.id === campaignId ? _campaign : campaign));
//       setShowEditCampaignModal(false);
//       toast.success("Campaign updated");
//     } else {
//       toast.error("Error updating campaign, please try again");
//     }
//   }).catch((error) => {
//     console.error("Error updating campaign:", error);
//     toast.error("Error updating campaign, please try again");
//   });

// }
// {/* Campaigns */ }
// {
//   campaigns.length > 0 && false && (
//     <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
//       {campaigns.map((campaign) => (
//         <Col key={campaign.id} xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 10 }}>
//           <Card>
//             <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0 }}>
//               <div style={{ width: `calc(100% - 40px)` }}>
//                 <Text size="1" as='div' color='gray'>{AGENTS[campaign.agentId - 1].name}</Text>
//                 <Text size="4" weight="bold" as='div' color='gray'>{campaign.name}</Text>
//               </div>
//               <div style={{ width: 40 }}>
//                 <Switch variant="outline" checked={campaign.enabled} onCheckedChange={(checked) => toggleCampaignEnabled(campaign.id, checked)} />
//               </div>
//             </Row>
//             <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 0 }}>
//               <Col xs={6} sm={6} md={6} lg={4} xl={3} style={{ padding: 0, paddingRight: 10 }}>
//                 {/* Phone number */}
//                 <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Phone number</Text>
//                 <Text size="3" as='div' color='gray'>{campaign.phoneNumber ? campaign.phoneNumber : 'Not set'}</Text>
//               </Col>
//               <Col xs={6} sm={6} md={6} lg={4} xl={3} style={{ padding: 0, paddingRight: 10 }}>
//                 {/* Calendar */}
//                 <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Calendar</Text>
//                 <Text size="3" as='div' color='gray'>{campaign.calendarId ? campaign.calendarId : 'Not set'}</Text>
//               </Col>
//             </Row>
//             {/* Attributes */}
//             <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
//               {AGENTS[campaign.agentId - 1].attributes.map((attribute, index) => (
//                 <Col key={index} xs={6} sm={6} md={6} lg={4} xl={3} style={{ padding: 0, paddingRight: 10, paddingTop: 10 }}>
//                   <Text size="2" weight="bold" as='div' color='gray'>{attribute.label}</Text>
//                   <Text size="3" as='div' color='gray'>{attribute.type === 'select' ? attribute.options.find(option => option.value === campaign[attribute.name]).label : campaign[attribute.name]}</Text>
//                 </Col>
//               ))}
//             </Row>
//             <Row style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 20 }}>
//               <Button variant="soft" size="2" color='gray' style={{ marginRight: 10 }} onClick={() => {
//                 setCampaignId(campaign.id);
//                 setCampaignName(campaign.name);
//                 setCampaignDaysInAdvance(campaign.daysInAdvance);
//                 setCampaignEnabled(campaign.enabled);
//                 setCampaignPhoneNumber(campaign.phoneNumber);
//                 setCampaignTimeOfDay(campaign.timeOfDay);
//                 setCampaignTimezone(campaign.timezone);
//                 setCampaignLanguage(campaign.language);
//                 setShowEditCampaignModal(true);
//               }}><Pencil /> Edit</Button>
//               <AlertDialog.Root>
//                 <AlertDialog.Trigger>
//                   <Button variant="soft" size="2" color="red"><Trash /> Delete</Button>
//                 </AlertDialog.Trigger>
//                 <AlertDialog.Content maxWidth="450px">
//                   <AlertDialog.Title>Delete {campaign.name}</AlertDialog.Title>
//                   <AlertDialog.Description size="2">
//                     Are you sure you want to delete this campaign?
//                   </AlertDialog.Description>

//                   <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
//                     <AlertDialog.Cancel>
//                       <Button variant="soft" color="gray">
//                         Cancel
//                       </Button>
//                     </AlertDialog.Cancel>
//                     <AlertDialog.Action>
//                       <Button variant="solid" color="red" onClick={() => deleteCampaign(campaign.id)}>
//                         Delete
//                       </Button>
//                     </AlertDialog.Action>
//                   </Row>
//                 </AlertDialog.Content>
//               </AlertDialog.Root>
//             </Row>
//           </Card>
//         </Col>
//       ))}
//     </Row>
//   )
// }

// {/* Edit campaign modal */ }
// <Dialog.Root open={showEditCampaignModal}>
//   <Dialog.Content style={{ minWidth: 200 }}>
//     <Dialog.Title>Edit campaign</Dialog.Title>
//     <VisuallyHidden>
//       <Dialog.Description>Enter a name and other details</Dialog.Description>
//     </VisuallyHidden>

//     {/* Form */}
//     <div style={{ width: '100%' }}>

//       {/* Name of campaign */}
//       <Text size="2" weight="bold" as='div' color='gray'>Name</Text>
//       <TextField.Root variant="outline" style={{ marginTop: 5 }} value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />

//       {/* Phone number */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Phone number</Text>
//       <Text size="1" as='div' color='gray'>The phone number the agent should send reminders to.</Text>
//       <Select.Root variant="outline" value={campaignPhoneNumber} onValueChange={(value) => setCampaignPhoneNumber(value)}>
//         <Select.Trigger placeholder="Select one" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {phoneNumbers.map((phoneNumber) => (
//             <Select.Item key={phoneNumber} value={phoneNumber}>{phoneNumber}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Number of days */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Days in advance</Text>
//       <Text size="1" as='div' color='gray'>The number of days before the appointment the patient should receive a reminder. Enter a value between 1 and 30.</Text>
//       <TextField.Root variant="outline" type='number' min={1} max={30} style={{ marginTop: 5 }} value={campaignDaysInAdvance} onChange={(e) => setCampaignDaysInAdvance(e.target.value)} />

//       {/* Time of day */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Time of day</Text>
//       <Text size="1" as='div' color='gray'>The time of day the agent should send reminders.</Text>
//       <Select.Root variant="outline" value={campaignTimeOfDay} onValueChange={(v) => setCampaignTimeOfDay(v)}>
//         <Select.Trigger placeholder="Select a time of day" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'timeOfDay').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Timezone */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Timezone</Text>
//       <Text size="1" as='div' color='gray'>The timezone the agent should send reminders in.</Text>
//       <Select.Root variant="outline" value={campaignTimezone} onValueChange={(v) => setCampaignTimezone(v)}>
//         <Select.Trigger placeholder="Select a timezone" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'timezone').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Language */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Language</Text>
//       <Text size="1" as='div' color='gray'>The language the agent should send reminders in.</Text>
//       <Select.Root variant="outline" value={campaignLanguage} onValueChange={(v) => setCampaignLanguage(v)}>
//         <Select.Trigger placeholder="Select a language" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'language').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//     </div>

//     <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 0, marginRight: 0, marginTop: 60 }}>
//       <Button variant="soft" size="2" color='gray' onClick={() => setShowEditCampaignModal(false)}>Cancel</Button>
//       <Button variant="soft" size="2" disabled={!campaignName || !campaignDaysInAdvance || campaignName.length === 0 || campaignDaysInAdvance < 1 || campaignDaysInAdvance > 30} onClick={() => saveCampaignEdits()}>Save</Button>
//     </Row>

//   </Dialog.Content>
// </Dialog.Root>

// {/* New campaign modal */ }
// <Dialog.Root open={showNewCampaignModal}>
//   <Dialog.Content style={{ minWidth: 200 }}>
//     <Dialog.Title>New campaign</Dialog.Title>
//     <VisuallyHidden>
//       <Dialog.Description>Enter a name and other details</Dialog.Description>
//     </VisuallyHidden>

//     {/* Form */}
//     <div style={{ width: '100%' }}>

//       {/* Name of campaign */}
//       <Text size="2" weight="bold" as='div' color='gray'>Name</Text>
//       <TextField.Root variant="outline" style={{ marginTop: 5 }} value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />

//       {/* Phone number */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Phone number</Text>
//       <Text size="1" as='div' color='gray'>The phone number the agent should send reminders to.</Text>
//       <Select.Root variant="outline" value={campaignPhoneNumber} onChange={(e) => setCampaignPhoneNumber(e.target.value)}>
//         <Select.Trigger placeholder="Select one" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {phoneNumbers.map((phoneNumber) => (
//             <Select.Item key={phoneNumber} value={phoneNumber}>{phoneNumber}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Number of days */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Days in advance</Text>
//       <Text size="1" as='div' color='gray'>The number of days before the appointment the patient should receive a reminder. Enter a value between 1 and 30.</Text>
//       <TextField.Root variant="outline" type='number' min={1} max={30} style={{ marginTop: 5 }} value={campaignDaysInAdvance} onChange={(e) => setCampaignDaysInAdvance(e.target.value)} />

//       {/* Time of day */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Time of day</Text>
//       <Text size="1" as='div' color='gray'>The time of day the agent should send reminders.</Text>
//       <Select.Root variant="outline" value={campaignTimeOfDay} onValueChange={(value) => setCampaignTimeOfDay(value)}>
//         <Select.Trigger placeholder="Select a time of day" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'timeOfDay').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Timezone */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Timezone</Text>
//       <Text size="1" as='div' color='gray'>The timezone the agent should send reminders in.</Text>
//       <Select.Root variant="outline" value={campaignTimezone} onValueChange={(value) => setCampaignTimezone(value)}>
//         <Select.Trigger placeholder="Select a timezone" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'timezone').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//       {/* Language */}
//       <Text size="2" weight="bold" as='div' color='gray' style={{ marginTop: 20 }}>Language</Text>
//       <Text size="1" as='div' color='gray'>The language the agent should send reminders in.</Text>
//       <Select.Root variant="outline" value={campaignLanguage} onValueChange={(value) => setCampaignLanguage(value)}>
//         <Select.Trigger placeholder="Select a language" style={{ marginTop: 5 }} />
//         <Select.Content>
//           {AGENTS[0].attributes.find(attr => attr.name === 'language').options.map((option) => (
//             <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
//           ))}
//         </Select.Content>
//       </Select.Root>

//     </div>

//     <Row style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 60 }}>
//       <Button variant="soft" size="2" color='gray' onClick={() => setShowNewCampaignModal(false)}>Cancel</Button>
//       <Button variant="soft" size="2" disabled={!campaignName || !campaignDaysInAdvance || campaignName.length === 0 || campaignDaysInAdvance < 1 || campaignDaysInAdvance > 30} onClick={() => saveNewCampaign()}>Create</Button>
//     </Row>

//   </Dialog.Content>
// </Dialog.Root>