import { profile, isTodo } from '../data/profile';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

/** vCard 3.0 (best compatibility with iOS/Android camera "Add contact"). */
export function buildVCard(siteUrl?: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(profile.familyName)};${esc(profile.givenName)};;;`,
    `FN:${esc(profile.fullName)}`,
    `TITLE:${esc(profile.degree.es)}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `URL;TYPE=LinkedIn:${profile.linkedin}`,
    `URL;TYPE=GitHub:${profile.github}`,
  ];
  if (siteUrl) lines.push(`URL:${siteUrl}`);
  if (!isTodo(profile.location)) lines.push(`ADR;TYPE=WORK:;;;${esc(profile.location)};;;`);
  lines.push('END:VCARD');
  return lines.join('\r\n');
}
