// Firebase
import { db } from '../use-firebase.js';
import { collection, query, where, getDocs, addDoc, setDoc, limit, deleteDoc, doc, getDoc } from 'firebase/firestore';

// Update workspace
export const dbUpdateWorkspace = async(workspaceId, _workspace) => {
  try {
    const docRef = await setDoc(doc(db, "workspaces", workspaceId), _workspace);
    return true;
  } catch (error) {
    console.error("Error updating workspace:", error);
    return false;
  }
}

// Get appointments
export const dbGetAppointments = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "appointments"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _appointments = snapshot.docs.map((doc) => doc.data());
    return _appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

// Create appointment
export const dbCreateAppointment = async(appointment) => {
  try {
    const docRef = await addDoc(collection(db, "appointments"), appointment);
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment:", error);
    return null;
  }
}

// Update appointment
export const dbUpdateAppointment = async(appointment) => {
  try {
    const snapshot = await getDocs(query(collection(db, "appointments"), where("id", "==", appointment.id), where("workspaceId", "==", appointment.workspaceId), limit(1)));
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await setDoc(docRef, appointment);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating appointment:", error);
    return false;
  }
}

// Get campaigns
export const dbGetCampaigns = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "campaigns"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _campaigns = snapshot.docs.map((doc) => doc.data());
    return _campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
}

// Get campaign
export const dbGetCampaign = async(campaignId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "campaigns"), where("id", "==", campaignId), where("workspaceId", "==", workspaceId), limit(1)));
    if (snapshot.empty) {
      return null;
    }
    const _campaign = snapshot.docs.map((doc) => doc.data());
    return _campaign[0];
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return null;
  }
}

// Create campaign
export const dbCreateCampaign = async(campaign) => {
  try {
    const docRef = await addDoc(collection(db, "campaigns"), campaign);
    return docRef.id;
  } catch (error) {
    console.error("Error creating campaign:", error);
    return null;
  }
}

// Update campaign
export const dbUpdateCampaign = async(campaignId, workspaceId, campaign) => {
  try {
    const snapshot = await getDocs(query(collection(db, "campaigns"), where("id", "==", campaignId), where("workspaceId", "==", workspaceId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = snapshot.docs[0].ref;
    await setDoc(docRef, campaign);
    return true;
  } catch (error) {
    console.error("Error updating campaign:", error);
    return false;
  }
}

// Delete campaign
export const dbDeleteCampaign = async(campaignId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "campaigns"), where("id", "==", campaignId), where("workspaceId", "==", workspaceId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = snapshot.docs[0].ref;
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return false;
  }
}

// Get phone numbers
export const dbGetPhoneNumbers = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "phonenumbers"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _phoneNumbers = snapshot.docs.map((doc) => doc.data());
    return _phoneNumbers;
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return [];
  }
}

// Get calendars
export const dbGetCalendars = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("workspaceId", "==", workspaceId)));
    if (snapshot.empty) {
      return [];
    }
    const _calendars = snapshot.docs.map((doc) => doc.data());
    return _calendars;
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return [];
  }
}

// Create calendar
export const dbCreateCalendar = async(calendar) => {
  try {
    const docRef = await addDoc(collection(db, "calendars"), calendar);
    return docRef.id;
  } catch (error) {
    console.error("Error creating calendar:", error);
    return null;
  }
}

// Delete calendar
export const dbDeleteCalendar = async(calendarId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("id", "==", calendarId), where("workspaceId", "==", workspaceId), limit(1)));
    const docRef = snapshot.docs[0].ref;
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return false;
  }
}

// Update calendar name
export const dbUpdateCalendarName = async(calendarId, name, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "calendars"), where("id", "==", calendarId), where("workspaceId", "==", workspaceId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = snapshot.docs[0].ref;
    await setDoc(docRef, { name: name }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating calendar name:", error);
    return false;
  }
}

// Get logs
export const dbGetLogs = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "logs"), where("workspaceId", "==", workspaceId)));
    const _logs = snapshot.docs.map((doc) => doc.data());
    return _logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

// Get tasks
export const dbGetTasks = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "tasks"), where("workspaceId", "==", workspaceId)));
    const _tasks = snapshot.docs.map((doc) => doc.data());
    return _tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// Get tasks by appointment id
export const dbGetTasksByAppointmentId = async(appointmentId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "tasks"), where("appointmentId", "==", appointmentId), where("workspaceId", "==", workspaceId)));
    const _tasks = snapshot.docs.map((doc) => doc.data());
    return _tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// Create task
export const dbCreateTask = async(task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    return docRef.id;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
}

// Get agents
export const dbGetAgents = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("workspaceId", "==", workspaceId)));
    const _agents = snapshot.docs.map((doc) => doc.data());
    return _agents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

// Get agent
export const dbGetAgent = async(agentId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("id", "==", agentId), where("workspaceId", "==", workspaceId), limit(1)));
    const _agent = snapshot.docs.map((doc) => doc.data());
    return _agent[0];
  } catch (error) {
    console.error("Error fetching agent:", error);
    return null;
  }
}

// Create agent
export const dbCreateAgent = async(agent) => {
  try {
    const docRef = await addDoc(collection(db, "agents"), agent);
    return docRef.id;
  } catch (error) {
    console.error("Error creating agent:", error);
    return null;
  }
}

// Update agent
export const dbUpdateAgent = async(agent) => {
  try {
    const snapshot = await getDocs(query(collection(db, "agents"), where("id", "==", agent.id), where("workspaceId", "==", agent.workspaceId), limit(1)));
    if (snapshot.empty) {
      return false;
    }
    const docRef = snapshot.docs[0].ref;
    await setDoc(docRef, agent);
    return true;
  } catch (error) {
    console.error("Error updating agent:", error);
    return false;
  }
}

// Get integrations
export const dbGetIntegrations = async(workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "integrations"), where("workspaceId", "==", workspaceId)));
    const _integrations = snapshot.docs.map((doc) => doc.data());
    return _integrations;
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return [];
  }
}

// Create integration
export const dbCreateIntegration = async(integration) => {
  try {
    const docRef = await addDoc(collection(db, "integrations"), integration);
    return docRef.id;
  } catch (error) {
    console.error("Error creating integration:", error);
    return null;
  }
}

// Update integration
export const dbUpdateIntegration = async(integration) => {
  try {
    const snapshot = await getDocs(query(collection(db, "integrations"), where("id", "==", integration.id), where("workspaceId", "==", integration.workspaceId), limit(1)));
    const docRef = snapshot.docs[0].ref;
    await setDoc(docRef, integration);
    return true;
  } catch (error) {
    console.error("Error updating integration:", error);
    return false;
  }
}

// Delete integration
export const dbDeleteIntegration = async(integrationId, workspaceId) => {
  try {
    const snapshot = await getDocs(query(collection(db, "integrations"), where("id", "==", integrationId), where("workspaceId", "==", workspaceId), limit(1)));
    const docRef = snapshot.docs[0].ref;
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting integration:", error);
    return false;
  }
}