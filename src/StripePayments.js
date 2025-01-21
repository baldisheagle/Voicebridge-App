import React, { useEffect } from 'react';
import { useRequireAuth } from "./use-require-auth.js";
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Spinner } from "react-bootstrap";
import toast, { Toaster } from 'react-hot-toast';

export default function StripePayments() {

  const auth = useRequireAuth();
  const navigate = useNavigate();
  const props = useParams();

  useEffect(() => {
    if (props && props.status && ['success', 'canceled'].includes(props.status)) {
      if (props.status === 'success') {
        toast.success('Successfully updated subscription!');
        navigate('/billing');
      } else {
        toast.error('Subscription update canceled');
        navigate('/billing');
      }
    } else {
      navigate('/notfound')
    }
    window.scrollTo(0, 0);
  }, [auth]);

  return (
    <Row style={{ justifyContent: 'center', marginTop: 20, marginBottom: 40 }}>
      <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
        <Spinner animation="border" role="status" />
      </Row>
      <Toaster toastOptions={{ position: "top-right", duration: 4000, style: { backgroundColor: `var(--bg-primary)`, color: `var(--text-primary)` } }} />
    </Row>
  )

}

