import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { useMediaQuery } from '../../shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { ThemeContext } from "../../Theme.js";
import { Button, DropdownMenu, Spinner, Table, Text, AlertDialog, Dialog, VisuallyHidden, TextField } from '@radix-ui/themes';
import { dbGetCalendars, dbDeleteCalendar, dbGetCampaigns, dbCreateCalendar, dbUpdateCalendarName } from '../../utilities/database.js';
import { GoogleLogo, Pencil, Plus, Trash } from '@phosphor-icons/react';
import toast, { Toaster } from 'react-hot-toast';
import Moment from 'react-moment';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../../use-firebase.js';
import { v4 as uuidv4 } from 'uuid';

export default function Calendars() {

  const auth = useRequireAuth();

  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  let isPageWide = useMediaQuery('(min-width: 960px)');

  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user && auth.workspace) {
      initialize();
    }
  }, [auth]);

  // Initialize
  const initialize = async() => {
    setLoading(false);
  }

  // Delete calendar
  const deleteCalendar = async(calendarId) => {

  }

  // Connect calendly
  // const connectCalendly = () => {
  //   // TODO: Switch to production credentials
  //   const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${process.env.REACT_APP_CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_CALENDLY_REDIRECT_URI_SANDBOX}`;
  //   window.location.href = authUrl;
  // }

  // Connect Google Calendar
  const connectGoogleCalendar = () => {
    const provider = new GoogleAuthProvider();
    // Add all required scopes
    provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
    provider.addScope('https://www.googleapis.com/auth/calendar.events.readonly');
    
    // Force consent screen to always appear and request offline access
    provider.setCustomParameters({
      access_type: 'offline',
      prompt: 'consent select_account'
    });
    
    signInWithPopup(firebaseAuth, provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      // Get refresh token from the user object
      const refreshToken = result.user.refreshToken;
      
      console.log("Google Calendar connected");
      saveCalendar('Google', 'google', accessToken, refreshToken);
    }).catch((error) => {
      console.error("Error connecting Google Calendar:", error);
      toast.error("Error connecting Google Calendar");
    });
  }

  // Save calendar
  const saveCalendar = async(name, provider, accessToken, refreshToken) => {

  }

  // Update calendar name
  const updateCalendarName = async(calendarId, name) => {
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

          </Col>
          <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>

          </Col>
        </Row>

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

