/*
    Create customer
    Parameters
        email
        user_id
    Response
        user
*/

export const stripeCreateCustomer = async (email, user_id) => {

  try {

    let responseStripe = await fetch('https://stripecreatecustomer-zdw5tjm7ca-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_API_AUTHORIZATION_CODE}`
      },
      body: JSON.stringify({
        customer_email: email,
        user_id: user_id,
      })
    });

    if (responseStripe.status === 200) {
      let responseStripeJson = await responseStripe.json();
      if (responseStripeJson) {
        // console.log('received from stripe', responseStripeJson);
        return responseStripeJson.id;
      } else {
        return null;
      }
    } else {
      return null;
    }

  } catch (error) {
    return null;
  }

};

/*
    Get checkout session url
    Parameters
        price_id
        customer id (optional)
    Response
        user
*/

export const stripeGetCheckoutSession = async (price_id, stripe_customer_id) => {

  let responseStripe = await fetch('https://stripecreatecheckoutsession-zdw5tjm7ca-uc.a.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_AUTHORIZATION_CODE}`
    },
    body: JSON.stringify({
      price_id: price_id,
      stripe_customer_id: stripe_customer_id,
    })
  });

  if (responseStripe.status === 200) {
    let responseStripeJson = await responseStripe.json();
    if (responseStripeJson && responseStripeJson.url) {
      // console.log('received from stripe', responseStripeJson);
      return responseStripeJson.url;
    } else {
      return null;
    }
  } else {
    return null;
  }

};

/*
    Get customer portal session url
    Parameters
        customer id
    Response
        url
*/

export const stripeGetCustomerPortalSession = async (stripe_customer_id) => {

  let responseStripe = await fetch('https://stripecreatecustomerportalsession-zdw5tjm7ca-uc.a.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_AUTHORIZATION_CODE}`
    },
    body: JSON.stringify({
      stripe_customer_id: stripe_customer_id,
    })
  });

  if (responseStripe.status === 200) {
    let responseStripeJson = await responseStripe.json();
    if (responseStripeJson && responseStripeJson.url) {
      //   console.log('received from stripe', responseStripeJson);
      return responseStripeJson.url;
    } else {
      return null;
    }
  } else {
    return null;
  }

};

/*
    Get subscription
    Parameters
        subscription id
    Response
        subscription object
*/

export const stripeGetSubscription = async (stripe_subscription_id) => {

  let responseStripe = await fetch('https://stripegetsubscription-zdw5tjm7ca-uc.a.run.app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_API_AUTHORIZATION_CODE}`
    },
    body: JSON.stringify({
      subscription_id: stripe_subscription_id,
    })
  });

  if (responseStripe.status === 200) {
    let responseStripeJson = await responseStripe.json();
    if (responseStripeJson && responseStripeJson.subscription) {
        // console.log('received subscription from stripe', responseStripeJson.subscription);
      return responseStripeJson.subscription;
    } else {
      return null;
    }
  } else {
    return null;
  }

};