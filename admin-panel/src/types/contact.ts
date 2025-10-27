export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  location: string;
  dateOfBirth: string; // ISO 8601 date
  gender: 'Male' | 'Female' | 'Other Gender';
  message?: string;
  status: 'pending' | 'contacted' | 'resolved' | 'archived';
  notes: string;
  submittedAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
  createdAt: string; // ISO 8601 datetime
}

export interface ContactPagination {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ContactStatistics {
  total: number;
  today: number;
  byStatus: {
    pending: number;
    contacted: number;
    resolved: number;
    archived: number;
  };
}

export interface ContactsResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: ContactPagination;
  };
}

export interface ContactStatsResponse {
  success: boolean;
  data: ContactStatistics;
}

export interface ContactResponse {
  success: boolean;
  data: Contact;
  message?: string;
}

export interface ContactUpdateData {
  status?: 'pending' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
}

