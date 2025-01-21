import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../use-require-auth.js';
import { dbCreateCalendar } from '../../utilities/database.js';
import toast, { Toaster } from 'react-hot-toast';
import { Row, Col } from 'react-bootstrap';
import { Spinner } from '@radix-ui/themes';
import { v4 as uuidv4 } from 'uuid';

export default function CalendlyConnect() {

  const auth = useRequireAuth();
  const navigate = useNavigate();

  // Get code from URL params
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  useEffect(() => {
    if (!code) {
      navigate('/integrations');
    }
    if (auth && auth.user && auth.workspace && code) {
      fetchAccessToken(code);
    }
  }, [code, auth]);

  const fetchAccessToken = async (code) => {
    try {
      const response = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: process.env.REACT_APP_CALENDLY_CLIENT_ID,
          client_secret: process.env.REACT_APP_CALENDLY_CLIENT_SECRET,
          redirect_uri: process.env.REACT_APP_CALENDLY_REDIRECT_URI_SANDBOX,
          code,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch access token");

      const data = await response.json();

      // Save calendar
      saveCalendar(data.access_token);
    
    } catch (error) {
      console.error("Error fetchi`ng access token:", error);
    }
  };


  const saveCalendar = async(accessToken) => {
    let calendar = {
      id: uuidv4(),
      name: 'Calendly',
      type: 'calendly',
      accessToken: accessToken,
      workspaceId: auth.workspace.id,
      createdBy: auth.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let result = await dbCreateCalendar(calendar);
    if (result) {
      toast.success('Connected to Calendly');
      navigate('/integrations');
    } else {
      toast.error('Failed to connect to Calendly');
      navigate('/integrations');
    }
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', paddingTop: 10, paddingLeft: 10, paddingBottom: 10 }}>
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
        <Spinner size="2" />
      </Row>
      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

}