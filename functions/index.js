const { v4: uuidv4 } = require('uuid');

// Firebase
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
const db = getFirestore();

// Cors
const cors = require('cors');
const logger = require("firebase-functions/logger");

// Sendgrid
const sgMail = require('@sendgrid/mail');

// Dotenv
require('dotenv').config();

// Stripe
// const stripe = require('stripe')(process.env.REACT_APP_STRIPE_SECRET_KEY);

// Sendgrid
const emailTemplates = {
  NewInvitationEmail: "d-2b28b347865f44da8e17fad96bbb36ff",
  WelcomeEmail: "d-0752ffa59ab3486db935fd71c87d2694",
};

// Allowed origins
const allowedOrigins = ['https://voicebridge-app.web.app', 'https://app.voicebridgeai.com']; // , 'http://localhost:3000'

// Cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,POST',
  credentials: true,
};

// Cors middleware
const corsMiddleware = cors(corsOptions);

/*
  Function: Get access token from Epic
  Parameters:
    code
  Return:
    accessToken
    refreshToken
*/

exports.getAccessTokenFromEpic = onRequest((req, res) => {
  console.log('Getting access token from Epic', req.body);
  console.log('Epic client ID:', process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD);
  console.log('Epic client secret:', process.env.REACT_APP_EPIC_CLIENT_SECRET);
  console.log('Epic redirect URI:', process.env.REACT_APP_EPIC_REDIRECT_URI);
  corsMiddleware(req, res, async () => {
    
    const code = req.body.code;
    
    try {

      const response = await fetch('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token', {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.REACT_APP_EPIC_CLIENT_ID_NON_PROD,
          client_secret: process.env.REACT_APP_EPIC_CLIENT_SECRET,
          redirect_uri: process.env.REACT_APP_EPIC_REDIRECT_URI,
          code: code,
        }),
      });

      if (!response.ok) {
        // Get the error response body
        const errorBody = await response.text();
        console.error('Epic API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return res.status(response.status).json({
          error: "Failed to fetch access token",
          details: errorBody,
          status: response.status
        });
      }

      const data = await response.json();
      console.log('Successfully retrieved access token');
      res.status(200).send(data);

    } catch (error) {
      console.error("Error fetching access token:", error);
      res.status(500).json({ 
        error: "Error fetching access token",
        message: error.message 
      });
    }
  });
});

/*
  Function: Get access token from DrChrono
  Parameters:
    code
  Return:
    appointments
*/

exports.getAccessTokenFromDrChrono = onRequest((req, res) => {
  console.log('Getting access token from DrChrono', req.body);
  corsMiddleware(req, res, async () => {
    const code = req.body.code;
    try {
      const response = await fetch('https://drchrono.com/o/token/', {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.REACT_APP_DRCHRONO_CLIENT_ID,
          client_secret: process.env.REACT_APP_DRCHRONO_CLIENT_SECRET,
          redirect_uri: process.env.REACT_APP_DRCHRONO_REDIRECT_URI,
          code: code,
        }),
      });

      if (!response.ok) {
        // Get the error response body
        const errorBody = await response.text();
        console.error('DrChrono API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return res.status(response.status).json({
          error: "Failed to fetch access token",
          details: errorBody,
          status: response.status
        });
      }

      const data = await response.json();
      console.log('Successfully retrieved access token');
      res.status(200).send(data);

    } catch (error) {
      console.error("Error fetching access token:", error);
      res.status(500).json({ 
        error: "Error fetching access token",
        message: error.message 
      });
    }
  });
});

/*
  Scheduled: Pull in events from Google Calendar
*/

exports.getEventsFromCalendar = onSchedule('every 5 minutes', async () => { // 0 * * * *

  const currentHour = new Date().getHours();
  console.log('Pulling in events from Google Calendar at', currentHour + ':00');
  
  try {

      // Get calendars
      let querySnapshot = await db.collection('calendars').where('provider', '==', 'google').get();

      // Get the appointments from the calendar
      console.log('Found', querySnapshot.docs.length, 'calendars');
      
      let appointments = [];

      if (querySnapshot.docs.length > 0) {
        for (let calendar of querySnapshot.docs) {
          const calendarRef = calendar.ref;
          // console.log('callling getGoogleCalendarEvents for', calendar.data());
          let events = await getGoogleCalendarEvents(
            calendar.data().accessToken,
            calendar.data().refreshToken,
            calendarRef
          );
          
          console.log('Found', events.length, 'events');

          for (let event of events) {
            // Update appointment in database if it exists, otherwise create it
            let appointment = await db.collection('appointments').where('id', '==', event.id).limit(1).get();
            if (appointment.docs.length > 0) {
              console.log('Appointment found:', event.id);
              await appointment.docs[0].ref.update({
                startTime: event.start.dateTime,
                endTime: event.end.dateTime,
                summary: event.summary || 'Summary',
                location: event.location || 'No location provided',
                description: event.description || 'No description provided',
                updatedAt: new Date().toISOString(),
              });
            } else {
              console.log('Appointment not found:', event.id);
              await db.collection('appointments').add({
                id: event.id,
                startTime: event.start.dateTime,
                endTime: event.end.dateTime,
                summary: event.summary || 'Summary',
                location: event.location || 'No location provided',
                description: event.description || 'No description provided',
                calendarId: calendar.data().id,
                workspaceId: calendar.data().workspaceId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      console.log('Found', appointments.length, 'appointments');

    return;

  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return;
  }

});



/*
  Scheduled: Run campaigns every hour
*/

// exports.runCampaigns = onSchedule('0 * * * *', async () => {

//   const currentHour = new Date().getHours();
//   console.log('Running campaigns at', currentHour + ':00');
  
//   try {

//     let activeCampaigns = [];
//     let querySnapshot = await db.collection('campaigns').where('enabled', '==', true).get();

//     // console.log('Found', querySnapshot.docs.length, 'campaigns');
    
//     querySnapshot.forEach((doc) => {
//       activeCampaigns.push(doc.data());
//     });

//     // console.log('Active campaigns:', activeCampaigns.length);

//     // For each campaign, get the appointments from the calendar
//     for (let campaign of activeCampaigns) {

//       if (campaign.agentId === 1) { // Appointment reminder agent
        
//         // console.log('Campaign:', campaign.name);
        
//         if (campaign.calendarId) {

//           // Get calendar
//           let calendar = await db.collection('calendars').where('id', '==', campaign.calendarId).limit(1).get();
//           let calendarData = calendar.docs[0].data();
//           // console.log('\tCalendar:', calendarData.name);

//           let appointments = [];

//           // Get the appointments from the calendar
//           if (calendarData.provider === 'google') {
//             const calendarRef = calendar.docs[0].ref;  // Get reference to the calendar document
//             appointments = await getGoogleCalendarEvents(
//               calendarData.accessToken,
//               calendarData.refreshToken,
//               calendarRef
//             );
//             // console.log('\tNumber of appointments:', appointments.length);
//           }
            
//           // For each appointment, check if the apppointment is within calendar.hoursInAdvance
//           if (appointments.length > 0) {
//             for (let appointment of appointments) {

//               // console.log('\t\tAppointment:', appointment);

//               // Get appointment start time
//               const appointmentStartTime = new Date(appointment.start.dateTime);
//               const now = new Date();

//               // console.log('\t\tNow:', now);
//               // console.log('\t\tAppointment start time:', appointmentStartTime);
              
//               // Calculate hours until appointment
//               const hoursUntilAppointment = Math.round((appointmentStartTime - now) / (1000 * 60 * 60));

//               // console.log('\t\tHours until appointment:', hoursUntilAppointment);
//               // console.log('\t\tHours in advance:', campaign.hoursInAdvance);
              
//               // Check if the appointment is between hoursInAdvance and hoursInAdvance + 1
//               if (hoursUntilAppointment >= campaign.hoursInAdvance && hoursUntilAppointment < campaign.hoursInAdvance + 1) {
//                 console.log('Schedule call for:', appointment.summary, 'in', hoursUntilAppointment, 'hours');
//                 // Add call to logs
//                 const logId = uuidv4();
//                 db.collection('logs').doc(logId).set({
//                   id: logId,
//                   type: 'phone',
//                   campaignId: campaign.id,
//                   agentId: campaign.agentId,
//                   appointment: appointment,
//                   appointmentStartTime: appointmentStartTime,
//                   hoursInAdvance: campaign.hoursInAdvance,
//                   hoursUntilAppointment: hoursUntilAppointment,
//                   calendarId: campaign.calendarId,
//                   fromPhoneNumber: campaign.phoneNumber,
//                   toPhoneNumber: appointment.location || 'Unknown',
//                   status: 'scheduled',
//                   workspaceId: campaign.workspaceId,
//                   createdAt: new Date().toISOString(),
//                   updatedAt: new Date().toISOString(),
//                 });
//                 // TODO: Make call with Retell AI, pass in logId in metadata
//               }
//             }
//           }
//         }
//       }
//     }

//     return;

//   } catch (error) {
//     console.error("Error fetching active campaigns:", error);
//     return;
//   }

// });

/*
  Function: Get appointments from Google Calendar
  Parameters:
    accessToken
    refreshToken
    calendarDocRef
  Return:
    appointments
*/

async function getGoogleCalendarEvents(accessToken, refreshToken, calendarDocRef) {
  
  const calendarId = 'primary';
  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '10' // TODO: Remove this
  });

  async function fetchWithToken(token) {
    return fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  try {
    let response = await fetchWithToken(accessToken);

    // If token expired, refresh it
    if (response.status === 401 && refreshToken) {

      console.log("Access token expired, refreshing...");
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const newTokens = await tokenResponse.json();
      
      // Update the calendar document with new access token
      await calendarDocRef.update({
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        updatedAt: new Date().toISOString(),
      });

      console.log('Updated calendar with new tokens:', newTokens);

      // Retry the calendar request with new token
      response = await fetchWithToken(newTokens.access_token);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}


/*
  Function: Example
  Parameters:
    user_id
  Return:
    null
*/

// async function example(user_id) {

//   const { data, error } = await supabaseClient
//     .from('usage')
//     .insert([{
//       created_by: user_id,
//     }])

//   if (error) {
//     return false;
//   } else {
//     return true;
//   }

// }

/*
  Function: Stripe API: Create customer
  Parameters:
    customer_email
    user_id
  Return:
    null
*/

// exports.stripeCreateCustomer = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.customer_email) {

//         let customerEmail = req.body.customer_email;
//         let userId = req.body.user_id;

//         stripe.customers.create({
//           email: customerEmail,
//           metadata: {
//             user_id: userId
//           }
//         }).then((customer) => {
//           if (customer) {
//             res.status(200).send(customer);
//           } else {
//             res.status(400).send(JSON.stringify({ error: "Stripe error" }));
//           }
//         }).catch((error) => {
//           res.status(400).send(JSON.stringify({ error: "Stripe error" }));
//         })

//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });

/*
  Function: Stripe API: Create checkout session
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

// exports.stripeCreateCheckoutSession = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.price_id && req.body.stripe_customer_id) {
//         let priceId = req.body.price_id;
//         let customerId = req.body.stripe_customer_id;

//         stripe.checkout.sessions.create({
//           mode: "subscription",
//           line_items: [
//             {
//               price: priceId,
//               quantity: 1,
//             },
//           ],
//           success_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//           cancel_url: `${process.env.REACT_APP_STRIPE_REDIRECT_URL}/canceled`,
//           customer: customerId,
//         }).then((session) => {
//           res.status(200).send({ url: session.url });
//         }).catch((error) => {
//           return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
//         })

//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });


/*
  Function: Stripe API: Create customer billing portal
  Parameters:
    price_id: Stripe product price id
    stripe_customer_id: Stripe customer id
    customer_email: Customer email for billing
  Return:
    null
*/

// exports.stripeCreateCustomerPortalSession = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.stripe_customer_id) {
//         let customerId = req.body.stripe_customer_id;
//         stripe.billingPortal.sessions.create({
//           customer: customerId,
//           return_url: `${process.env.REACT_APP_STRIPE_PORTAL_URL}`,
//         }).then((session) => {
//           res.status(200).send({ url: session.url });
//         }).catch((error) => {
//           return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
//         })
//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });

/*
  Function: Stripe API: Get subscription status
  Parameters:
    subscription_id: Stripe subscription id
  Return:
    subscription object
*/

// exports.stripeGetSubscription = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.subscription_id) {
//         let subscriptionId = req.body.subscription_id;
//         stripe.subscriptions.retrieve(
//           subscriptionId
//         ).then((subscription) => {
//           res.status(200).send({ subscription: subscription });
//         }).catch((error) => {
//           return res.status(400).send(JSON.stringify({ error: "Stripe error" }));
//         })
//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });


/*
  Function: Stripe Webhooks
  Parameters:
  Return:
*/

// exports.stripeWebhooks = onRequest(
//   { cors: true },
//   (req, res) => {
//     let event = req.body;

//     const endpointSecret = process.env.REACT_APP_STRIPE_ENDPOINT_SECRET;
//     if (endpointSecret) {
//       // Get the signature sent by Stripe
//       const signature = req.headers['stripe-signature'];
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.rawBody,
//           signature,
//           endpointSecret
//         );
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed.`, err.message);
//         return res.sendStatus(400);
//       }
//     }
//     let subscription;
//     // Handle the event
//     switch (event.type) {
//       case 'customer.subscription.trial_will_end':
//         subscription = event.data.object;
//         console.log('customer.subscription.trial_will_end', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'customer.subscription.deleted':
//         subscription = event.data.object;
//         console.log('customer.subscription.deleted', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'customer.subscription.created':
//         subscription = event.data.object;
//         console.log('customer.subscription.created', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'customer.subscription.updated':
//         subscription = event.data.object;
//         console.log('customer.subscription.updated', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'customer.subscription.paused':
//         subscription = event.data.object;
//         console.log('customer.subscription.paused', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'customer.subscription.resumed':
//         subscription = event.data.object;
//         console.log('customer.subscription.resumed', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       case 'entitlements.active_entitlement_summary.updated':
//         subscription = event.data.object;
//         console.log('entitlements.active_entitlement_summary.updated', subscription.status);
//         if (subscription.id && subscription.customer && subscription.status && subscription.plan && subscription.plan.id) {
//           stripeUpdateUser(subscription);
//         }
//         break;
//       default:
//         // Unexpected event type
//         console.log(`Unhandled event type ${event.type}.`);
//     }
//     // Return a 200 response to acknowledge receipt of the event
//     res.send();
//   }
// );


/*
  Function: Update user with Stripe details
  Parameters:
    customer_id
    plan_id
    status
  Return:
    null
*/

// async function stripeUpdateUser(subscription) {

//   const { data, error } = await supabaseClient
//     .from('users')
//     .update({
//       stripe_subscription_id: subscription.id,
//       stripe_plan_id: subscription.plan.id,
//       stripe_status: subscription.status,
//       stripe_current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start*1000) : null,
//       stripe_current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end*1000) : null,
//     })
//     .eq('stripe_customer_id', subscription.customer)

//   // console.log('user stripe update error', data, error);

//   if (error) {
//     return false;
//   } else {
//     return true
//   }

// }

/*
  Function: Sendgrid API: Send welcome email
  Parameters:
    email
    to_name
  Return:
    null
*/

// exports.sendgridWelcomeEmail = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.email && req.body.to_name) {

//         let email = req.body.email;
//         let to_name = req.body.to_name;

//         sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);
//         sgMail.send({
//           to: email,
//           replyTo: "hello@terastack.ai",
//           from: "Terastack <hello@terastack.ai>",
//           templateId: emailTemplates["WelcomeEmail"],
//           dynamic_template_data: {
//             to_name: to_name,
//           }
//         })

//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });

/*
  Function: MixPanel Track Event
  Parameters:
    user_id
    event_name
    event
  Return:
    200 or 400
*/

// exports.mixpanelTrackEvent = onRequest((req, res) => {
//   corsMiddleware(req, res, async () => {
//     if (req && req.headers && req.headers.authorization && req.headers.authorization === 'Bearer ' + process.env.REACT_APP_API_AUTHORIZATION_CODE) {
//       if (req.body && req.body.user_id && req.body.event_name && req.body.event) {

//         let user_id = req.body.user_id;
//         let event_name = req.body.event_name;
//         let event_object = req.body.event;

//         try {
          
//           // Create an instance of the mixpanel client
//           const mixpanel = Mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN);

//           // Track event
//           mixpanel.track(event_name, event_object);
          
//           // Increment document created
//           if (event_name === 'Document Created') {
//             mixpanel.people.increment(user_id, 'documents_created');
//           }
          
//           // Increment file created
//           if (event_name === 'File Created') {
//             mixpanel.people.increment(user_id, 'files_created');
//           }

//           res.status(200).send();

//         } catch(err) {
//           res.status(400).send(JSON.stringify({ error: "Mixpanel error" }));
//         }
//       } else {
//         res.status(400).send(JSON.stringify({ error: "Missing parameters" }));
//       }
//     } else {
//       res.status(400).send(JSON.stringify({ error: "Authorization failed" }));
//     }
//   })
// });



