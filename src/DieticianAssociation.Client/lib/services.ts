import { EventRegistration, NotificationDto, AssociationEvent } from '@/types/api';
import { getDieticianAssociationAPI, type CertificateDto } from '@/services/generated';

export const eventRegistrationApi = {
  getUserRegistrations: async (userId: string): Promise<EventRegistration[]> => []
};

export const certificateApi = {
  getUserCertificates: async (): Promise<CertificateDto[]> => {
    const api = getDieticianAssociationAPI();
    const response = await api.getApiCertificatesMyCertificates();
    return response.data;
  }
};

export const notificationApi = {
  getUserNotifications: async (userId: string, page: number, limit: number): Promise<NotificationDto[]> => []
};

export const eventsApi = {
  getUpcoming: async (): Promise<AssociationEvent[]> => []
};

export const adminApi = {
  getAllUsers: async (): Promise<any[]> => [],
  updateUserMembership: async (userId: string, data: any): Promise<void> => {},
  updateUserRole: async (userId: string, data: any): Promise<void> => {},
  deleteUser: async (userId: string): Promise<void> => {}
};