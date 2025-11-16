import rawContactInfo from '@data/contact-info.json';
import type {
  ContactInfo,
  EmailChannel,
  OfficeLocation,
  PhoneChannel,
  SocialChannel,
} from '@types/contact';

type WithPrimaryFlag = { isPrimary?: boolean };

export type SocialEntry = [string, SocialChannel];

const contactInfo = rawContactInfo as ContactInfo;

const getPrimaryItem = <T extends WithPrimaryFlag>(
  items: T[]
): T | undefined => {
  if (!Array.isArray(items) || items.length === 0) {
    return undefined;
  }

  return items.find(item => item.isPrimary) ?? items[0];
};

export const getPrimaryPhone = (
  info: ContactInfo = contactInfo
): PhoneChannel | undefined => getPrimaryItem(info.contact.phones);

export const getPrimaryEmail = (
  info: ContactInfo = contactInfo
): EmailChannel | undefined => getPrimaryItem(info.contact.emails);

export const getPrimaryOffice = (
  info: ContactInfo = contactInfo
): OfficeLocation | undefined => getPrimaryItem(info.offices);

export const getActiveSocialEntries = (
  info: ContactInfo = contactInfo
): Array<SocialEntry> => {
  const entries = Object.entries(info.social ?? {});

  return entries.filter(([, socialChannel]) => {
    if (!socialChannel?.url) {
      return false;
    }

    return socialChannel.isActive !== false;
  });
};

export default contactInfo;
