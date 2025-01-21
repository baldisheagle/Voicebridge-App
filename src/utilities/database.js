// Firebase
import { db } from '../use-firebase.js';
import { collection, query, where, getDocs, addDoc, setDoc, limit, deleteDoc, doc } from 'firebase/firestore';

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