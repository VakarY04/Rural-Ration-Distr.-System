// Single source of truth for site ownership & contact details.
// ---------------------------------------------------------------------------
// PERSONAL PROJECT: fill in your own name + a dedicated public email below.
// Everything (footer, copyright page, WIM owner, feedback inbox) reads from
// here, so a future government handover means editing THIS file only.
// Do NOT put a personal phone number or home address here — a public email
// is enough for citizens to reach you, without exposing private details.
// ---------------------------------------------------------------------------
export const siteMeta = {
  projectName: 'E-Ration Portal',
  // TODO(owner): replace with your name/alias before sharing publicly.
  ownerName: 'Vakar Younish',
  // TODO(owner): replace with a dedicated public email (not your private one).
  ownerEmail: 'faltu0756@gmail.com',
  // Honest framing for a personal project: never claim to BE the government.
  // If a department adopts this, swap this line for the official lineage sentence.
  // NOTE: display strings (tagline, ownership note, gov-link labels) live in
  // the i18n dictionaries as footer.* so they switch with the language toggle.
  // Outbound reference links — linking OUT to the government is always fine.
  // `id` resolves the visible label via t('footer.govLink' + id).
  govLinks: [
    { id: 'NationalPortal', href: 'https://www.india.gov.in/' },
    { id: 'DigitalIndia', href: 'https://www.digitalindia.gov.in/' },
    { id: 'myScheme', href: 'https://www.myscheme.gov.in/' },
  ],
};

export const ownerContact = `${siteMeta.ownerName} <${siteMeta.ownerEmail}>`;
