import { Calendar, Star, MessageSquare } from "@phosphor-icons/react";
import { LANGUAGES, REVIEW_PLATFORMS, DEFAULT_PHONE_NUMBERS } from "./lists";

export const APPOINTMENT_REMINDER_AGENT = {
    agentId: 1,
    agentName: "Alex",
    agentPhoto: "../assets/agents/appointment-reminder-alex.jpg",
    name: "Appointment Reminder",
    enabled: false,
    description: "Send automated SMS reminders to patients for their upcoming appointments.",
    mode: "SMS",
    defaultEnabled: false,
    attributes: [
        {
          name: "language",
          label: "Language",
          description: "The language the agent should send reminders in.",
          type: "select",
          default: "en-US",
          options: LANGUAGES,
          required: true,
        },
        {
          name: "phoneNumber",
          label: "Phone number",
          description: "The phone number the agent should use to send reminders.",
          type: "text",
          default: DEFAULT_PHONE_NUMBERS[0].id,
          required: true,
        },
        {
          name: "firstReminderLeadTime",
          label: "First reminder lead time",
          description: "The agent will send an SMS reminder these many hours before the appointment.",
          type: "number",
          default: 72,
          required: true,
        },
        {
          name: "secondReminderLeadTime",
          label: "Second reminder lead time",
          description: "The agent will send an SMS reminder these many hours before the appointment.",
          type: "number",
          default: 24,
          required: true,
        }
      ]
};

export const REVIEW_REQUESTER_AGENT = {
    agentId: 2,
    agentName: "Robin",
    agentPhoto: "../assets/agents/review-requester-robin.jpg",
    name: "Review Requester",
    enabled: false,
    description: "Send automated SMS reminders to patients to leave a review on Google, Yelp, or Zocdoc.",
    mode: "SMS",
    defaultEnabled: false,
    attributes: [
        {
          name: "language",
          label: "Language",
          description: "The language the agent should send reminders in.",
          type: "select",
          default: "en-US",
          options: LANGUAGES,
          required: true,
        },
        {
            name: "phoneNumber",
            label: "Phone number",
            description: "The phone number the agent should use to send reminders.",
            type: "text",
            default: DEFAULT_PHONE_NUMBERS[0].id,
            required: true,
          },
        {
          name: "platform",
          label: "Platform",
          description: "The platform the patient should leave a review on.",
          type: "select",
          default: "Google",
          options: REVIEW_PLATFORMS,
          required: true,
        },
        {
            name: "reviewLink",
            label: "Review link",
            description: "The link to the webpage where the patient can leave a review.",
            type: "text",
            default: "https://www.google.com/",
            required: true,
        },
        {
          name: "firstReminderLagTime",
          label: "First reminder lag time",
          description: "The agent will send a review request SMS these many hours after the appointment.",
          type: "number",
          default: 24,
          required: true,
        },
        {
          name: "secondReminderLagTime",
          label: "Second reminder lag time",
          description: "The agent will send a review request SMS these many hours after the appointment.",
          type: "number",
          default: 48,
          required: true,
        }
    ]
};

export const AGENTS = [
  { 
    id: 1, 
    name: "Appointment Reminder",
    enabled: true,
    description: "Make personalized human-like phone calls to remind patients of their upcoming appointments.",
    icon: <Calendar size={24} />,
    mode: "Phone",
    defaultEnabled: false,
    attributes: [
      {
        name: "language",
        label: "Language",
        description: "The language the agent should send reminders in.",
        type: "select",
        default: "en-US",
        options: LANGUAGES,
        required: true,
      },
      {
        name: "phoneNumber",
        label: "Phone number",
        description: "The phone number the agent should use to send reminders.",
        type: "text",
        default: DEFAULT_PHONE_NUMBERS[0].id,
        required: true,
      }
    ]
  },
  {
    id: 2,
    name: "Review Requester",
    enabled: false,
    description: "Make personalized human-like post-appointment phone calls request patients to leave a review on Google or Yelp.",
    icon: <Star size={24} />,
    mode: "SMS",
    defaultEnabled: false,
    attributes: [
      {
        name: "language",
        label: "Language",
        description: "The language the agent should send review requests in.",
        type: "select",
        default: "en-US",
        options: LANGUAGES,
        required: true,
      },
      {
        name: "platform",
        label: "Platform",
        description: "The platform the patient should leave a review on.",
        type: "select",
        default: "Google",
        options: REVIEW_PLATFORMS,
        required: true,
      },
      {
        name: "phoneNumber",
        label: "Phone number",
        description: "The phone number the agent should use to send review requests.",
        default: DEFAULT_PHONE_NUMBERS[0].id,
        type: "text",
        required: true,
      }
    ]
  },
  {
    id: 3,
    name: "Appointment Reminder",
    enabled: false,
    description: "Send SMS reminders to patients for their upcoming appointments.",
    icon: <Calendar size={24} />,
    mode: "SMS",
    defaultEnabled: false,
    attributes: [
      {
        name: "phoneNumber",
        label: "Phone number",
        description: "The phone number the agent should use to send reminders.",
        type: "text",
        default: DEFAULT_PHONE_NUMBERS[0].id,
        required: true,
      },
      {
        name: "language",
        label: "Language",
        description: "The language the agent should send reminders in.",
        type: "select",
        default: "en-US",
        options: LANGUAGES,
        required: true,
      },
    ]
  }
];