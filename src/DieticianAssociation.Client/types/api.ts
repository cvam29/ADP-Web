export enum RegistrationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface AssociationEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  type?: string;
  format?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  registrationStatus: RegistrationStatus;
}

export interface EventCertificate {
  id: string;
  eventId: string;
  eventTitle: string;
  issueDate: string;
  certificateUrl: string;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
