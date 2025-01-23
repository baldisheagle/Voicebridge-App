import { Calendar, Star } from "@phosphor-icons/react";
import { LANGUAGES, REVIEW_PLATFORMS, DEFAULT_PHONE_NUMBERS } from "./lists";

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
  }
];