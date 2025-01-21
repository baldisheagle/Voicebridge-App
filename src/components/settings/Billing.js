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

export default function Billing() {

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

      <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />
    </div>
  )

  

}

