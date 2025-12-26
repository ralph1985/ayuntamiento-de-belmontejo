export interface ContactEntity {
  name: string;
  domain: string;
}

export interface PhoneChannel {
  id: string;
  label: string;
  display: string;
  href: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface EmailChannel {
  id: string;
  label: string;
  address: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface OfficeLocation {
  id: string;
  label: string;
  street: string;
  locality: string;
  region?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  mapsUrl?: string;
  isPrimary?: boolean;
}

export interface SocialChannel {
  label: string;
  url: string;
  isActive?: boolean;
}

export interface ContactInfo {
  entity: ContactEntity;
  contact: {
    phones: PhoneChannel[];
    emails: EmailChannel[];
    formSender?: string;
    formRecipient?: string;
  };
  offices: OfficeLocation[];
  social: Record<string, SocialChannel>;
}
