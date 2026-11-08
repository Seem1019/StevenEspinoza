/**
 * Single source of truth for Steven's identity and contact data.
 * The whole site, the QR code and the vCard read from here.
 *
 * Rule: never invent data. Anything Steven has not provided stays as a visible
 * `TODO_*` marker so it can be filled in one place.
 */
export const profile = {
  fullName: 'Steven E Espinoza M',
  displayName: 'Steven Espinoza',
  givenName: 'Steven',
  familyName: 'Espinoza M',
  initials: 'SE',
  /** Academic title as provided. Translated label lives in i18n (common.profile.degree). */
  degree: { es: 'Máster en Ingeniería de Software', en: "Master's in Software Engineering" },
  email: 'steven.espinoza0604@gmail.com',
  /** E.164 without spaces, used for tel:, WhatsApp and the vCard. */
  phone: '+573007242261',
  phoneDisplay: '+57 300 724 2261',
  whatsapp: 'https://wa.me/573007242261',
  linkedin: 'https://www.linkedin.com/in/seem1010/',
  github: 'https://github.com/Seem1019',
  // --- Missing data: fill these in -------------------------------------------
  /** City / country shown in the footer and vCard. */
  location: 'TODO_LOCATION',
  /** Square photo in /public (e.g. '/steven.jpg'). Until then, initials are shown. */
  photo: 'TODO_PHOTO',
  /** Booking link (Calendly, Cal.com...). Until then, the CTA opens the contact dialog. */
  bookingUrl: 'TODO_BOOKING_URL',
} as const;

export const isTodo = (value: string) => value.startsWith('TODO_');
