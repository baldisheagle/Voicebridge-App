export const AGENTS = [
  { 
    id: 1, 
    name: "Appointment Reminder",
    mode: "phone",
    defaultEnabled: false,
    phoneNumber: null,
    integrations: [
      {
        name: "calendar",
        multiple: true,
        required: true,
      }
    ],
    attributes: [
      {
        name: "daysInAdvance",
        label: "Days in advance",
        description: "The number of days before the appointment the patient should receive a reminder. Enter a value between 1 and 30.",
        type: "number",
        default: 3,
        min: 1,
        max: 30,
        required: true,
      },
      {
        name: "timeOfDay",
        label: "Time of day",
        description: "The time of day the agent should send reminders.",
        type: "select",
        default: "10:00",
        options: [
          { value: "00:00", label: "12:00 AM" }, { value: "01:00", label: "1:00 AM" }, { value: "02:00", label: "2:00 AM" }, { value: "03:00", label: "3:00 AM" }, { value: "04:00", label: "4:00 AM" }, { value: "05:00", label: "5:00 AM" }, { value: "06:00", label: "6:00 AM" }, { value: "07:00", label: "7:00 AM" }, { value: "08:00", label: "8:00 AM" }, { value: "09:00", label: "9:00 AM" }, { value: "10:00", label: "10:00 AM" }, { value: "11:00", label: "11:00 AM" }, { value: "12:00", label: "12:00 PM" }, { value: "13:00", label: "1:00 PM" }, { value: "14:00", label: "2:00 PM" }, { value: "15:00", label: "3:00 PM" }, { value: "16:00", label: "4:00 PM" }, { value: "17:00", label: "5:00 PM" }, { value: "18:00", label: "6:00 PM" }, { value: "19:00", label: "7:00 PM" }, { value: "20:00", label: "8:00 PM" }, { value: "21:00", label: "9:00 PM" }, { value: "22:00", label: "10:00 PM" }, { value: "23:00", label: "11:00 PM" }
        ],
        required: true,
      },
      {
        name: "timezone",
        label: "Timezone",
        description: "The timezone the agent should send reminders in.",
        type: "select",
        default: "America/Los_Angeles",
        options: [
          { value: "America/Los_Angeles", label: "America/Los Angeles" }, { value: "America/New_York", label: "America/New York" }, { value: "America/Chicago", label: "America/Chicago" }, { value: "America/Denver", label: "America/Denver" }, { value: "America/Phoenix", label: "America/Phoenix" },
        ],
        required: true,
      },
      {
        name: "language",
        label: "Language",
        description: "The language the agent should send reminders in.",
        type: "select",
        default: "en",
        options: [
          { value: "en", label: "English" }, { value: "es", label: "Spanish" },
        ],
        required: true,
      }
    ]
  },
];
