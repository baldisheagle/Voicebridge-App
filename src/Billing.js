import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from './shared-functions.js';
import { Col, Row } from 'react-bootstrap';
import { useRequireAuth } from './use-require-auth.js';
import { Button, Card, Heading, Link, Spinner, Text } from '@radix-ui/themes';
import Footer from './components/common/Footer.js';
import toast, { Toaster } from 'react-hot-toast';
import Profile from './components/common/Profile.js';
import { ThemeContext } from './Theme.js';
import BackButton from './components/common/BackButton.js';
import { stripeCreateCustomer, stripeGetCheckoutSession, stripeGetCustomerPortalSession, stripeGetSubscription } from './utilities/stripe.js';
import { dbUpdateUser } from './utilities/sqldb.js';
import SidebarComponent from './components/common/Sidebar.js';
import Logo from './components/common/Logo.js';

export default function Billing() {

  const auth = useRequireAuth();
  const navigate = useNavigate();
  const theme = useContext(ThemeContext);

  let isPageWide = useMediaQuery('(min-width: 768px)');
  let billingPlanProStripePriceId = process.env.REACT_APP_BILLING_PLAN_PRO_STRIPE_PRICE_ID;

  const [currentPlan, setCurrentPlan] = useState('Free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && auth.user) {
      initialize();
    }
  }, [auth]);

  const initialize = async () => {

    // Free
    if (!auth.user.stripe_customer_id ||
      (auth.user.stripe_customer_id && !auth.user.stripe_plan_id) ||
      (auth.user.stripe_customer_id && auth.user.stripe_plan_id && auth.user.stripe_status !== 'active')
    ) {
      setCurrentPlan('Free');
      } else if (auth.user.stripe_plan_id === billingPlanProStripePriceId) {
      setCurrentPlan('Pro');
    }
    
    setLoading(false);

  };


  const getStripeCheckoutSession = async (price_id) => {

    setLoading(true);

    // Check if Stripe Customer Id is not null
    let stripeCustomerId = auth.user.stripe_customer_id;
    // console.log('auth.workspace.stripe_customer_id', auth.workspace.stripe_customer_id)
    if (stripeCustomerId === null) {
      // If null, create a new Stripe Customer Id
      stripeCustomerId = await stripeCreateCustomer(auth.user.email, auth.user.id);
      // console.log('received stripeCustomerId', stripeCustomerId);
      if (stripeCustomerId) {
        let res = await dbUpdateUser(auth.user.id, { stripe_customer_id: stripeCustomerId });
        // console.log('dbUpdateWorkspace', res);
        if (!res) {
          toast.error('Something did not work. Try again.');
          setLoading(false);
          return null;
        }
      } else {
        toast.error('Something did not work. Try again.');
        setLoading(false);
        return null;
      }
    }

    let url = await stripeGetCheckoutSession(price_id, stripeCustomerId);
    // console.log('url', url);
    if (url) {
      window.location.href = url;
    } else {
      toast.error('Could not process billing request.');
    }

    setLoading(false);

    return null;

  }

  const getStripePortalSession = async () => {

    setLoading(true);

    try {
      if (auth.user.stripe_customer_id) {
        let url = await stripeGetCustomerPortalSession(auth.user.stripe_customer_id);
        if (url) {
          window.location.href = url;
        } else {
          toast.error('Could not process portal session request.');
        }
      } else {
        toast.error('Could not process portal session request.');
      }
    } catch (error) {
      toast.error('Could not process portal session request.');
    }

    setLoading(false);

    return null;

  }

  const refreshSubscriptionStatus = async () => {
    setLoading(true);
    let subscription = await stripeGetSubscription(auth.user.stripe_subscription_id);
    if (subscription) {
      let res = await dbUpdateUser(auth.user.id, { stripe_plan_id: subscription.plan.id, stripe_status: subscription.status });
      if (res) {
        toast.success('Updated billing status!');
        // window.location.reload();
      } else {
        toast.error('Could not update status. Email hello@voicebridgeai.com if this problem persists.')
      }
    }
    setLoading(false);
    return null;
  }

  if (!auth || !auth.user || loading) {
    return (
      <Row style={{ justifyContent: 'center', marginTop: 20, marginBottom: 40 }}>
        <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginLeft: 0, marginRight: 0, height: '80vh' }}>
          <Spinner size="2" />
        </Row>
      </Row>
    )
  }

  return (
    <div>
      {/* <BackButton /> */}
      <Logo navigate={true} />
      <Profile />
      <SidebarComponent />

      <div style={{ marginLeft: 48, marginTop: 44, width: `calc(100% - 48px)` }}>

        <div style={{ position: 'relative', width: '100%', paddingLeft: isPageWide ? '20%' : '5%', paddingRight: isPageWide ? '20%' : '5%' }}>
          <Heading size="6">Billing</Heading>
        </div>

        <div style={{ position: 'relative', width: '100%', paddingLeft: isPageWide ? '20%' : '5%', paddingRight: isPageWide ? '20%' : '5%', height: '75vh', minHeight: 200, overflowY: 'auto' }}>
        
          <Text size="2" color="gray">You are currently on the <span style={{ fontWeight: 'bold' }}>{currentPlan}</span> plan.</Text>
          <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 0 }}>
              <Card style={{ width: '100%', marginTop: 10 }}>
                <Heading size="4" color="gray" style={{ marginBottom: 0 }}>Free</Heading>
                <div style={{ width: '100%' }}><Text size="2" variant="soft" color="gray">$0 per month</Text></div>
                <ul style={{ marginTop: 10 }}>
                  <li><Text size="2">10 one-time credits</Text></li>
                  <li><Text size="2">Record up to 1 minute per note</Text></li>
                  <li><Text size="2">Unlimited notes</Text></li>
                  <li><Text size="2">100MB total storage limit</Text></li>
                  <li><Text size="2">Email support</Text></li>
                </ul>
              </Card>
            </Col>
          </Row>
          <Row style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 0, marginRight: 0, marginTop: 10 }}>
            <Col xs={12} sm={12} md={12} lg={12} xl={12} style={{ padding: 0 }}>
              <Card style={{ width: '100%', marginTop: 10 }}>
                <Heading size="4" color="gray" style={{ marginBottom: 0 }}>Pro</Heading>
                <div style={{ width: '100%' }}><Text size="2" variant="soft" color="gray">$10 per month</Text></div>
                { currentPlan === 'Free' && (
                  <div style={{ width: '100%', marginTop: 10 }}><Text size="1" variant="soft"><Button onClick={() => getStripeCheckoutSession(process.env.REACT_APP_BILLING_PLAN_PRO_STRIPE_PRICE_ID)}>Upgrade to Pro</Button></Text></div>
                )}
                { currentPlan === 'Pro' && (
                  <div style={{ width: '100%', marginTop: 10 }}><Text size="1" variant="soft"><Button onClick={() => getStripePortalSession()}>Manage Subscription</Button></Text></div>
                )}
                <ul style={{ marginTop: 20 }}>
                  <li><Text size="2">1,000 credits per month</Text></li>
                  <li><Text size="2">Additional credits $0.10 each</Text></li>
                  <li><Text size="2">Record up to 10 minutes per note</Text></li>
                  <li><Text size="2">Unlimited notes</Text></li>
                  <li><Text size="2">1GB total storage limit</Text></li>
                  <li><Text size="2">Email support</Text></li>
                  <li><Text size="2">Cancel anytime</Text></li>
                </ul>
              </Card>
            </Col>
          </Row>

          <Footer />
        </div>

        <Toaster position='top-center' toastOptions={{ className: 'toast', style: { background: 'var(--gray-3)', color: 'var(--gray-11)' } }} />

      </div>
    </div>
  )


}


