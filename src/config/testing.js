export const TESTING_APPOINTMENTS = [
  {
    id: 1,
    name: "Annual Physical",
    patient: "John Doe",
    phoneNumber: "1234567890",
    appointmentType: "annual_physical",
    timestamp: "2024-01-01 10:00:00",
    provider: "Dr. Smith",
    location: "123 Main St, Anytown, USA",
    notes: "This is a note about the appointment",
  },
  {
    id: 2,
    name: "Follow-up Visit",
    patient: "Jane Smith",
    phoneNumber: "1234567890",
    appointmentType: "follow_up",
    timestamp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    provider: "Dr. Johnson",
    location: "456 Oak Ave, Anytown, USA",
    notes: "Follow up on previous treatment",
  },
  {
    id: 3,
    name: "Dental Cleaning",
    patient: "Robert Wilson",
    phoneNumber: "1234567890",
    appointmentType: "dental_cleaning",
    timestamp: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    provider: "Dr. Garcia",
    location: "789 Elm St, Anytown, USA", 
    notes: "Regular 6-month cleaning",
  },
  {
    id: 4,
    name: "Eye Exam",
    patient: "Sarah Miller",
    phoneNumber: "1234567890",
    appointmentType: "eye_exam",
    timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    provider: "Dr. Chen",
    location: "321 Pine Rd, Anytown, USA",
    notes: "Annual vision check",
  },
  {
    id: 5,
    name: "Vaccination",
    patient: "Michael Brown",
    phoneNumber: "1234567890",
    appointmentType: "vaccination",
    timestamp: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    provider: "Dr. Taylor",
    location: "654 Maple Dr, Anytown, USA",
    notes: "Flu shot appointment",
  }
];