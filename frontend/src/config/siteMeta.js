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
  tagline: 'Public Distribution System',
  // TODO(owner): replace with your name/alias before sharing publicly.
  ownerName: 'Vakar Younish',
  // TODO(owner): replace with a dedicated public email (not your private one).
  ownerEmail: 'faltu0756@gmail.com',
  // Honest framing for a personal project: never claim to BE the government.
  // If a department adopts this, swap this line for the official lineage sentence.
  ownershipNote: 'An independent civic project built for the people of India',
  // Outbound reference links — linking OUT to the government is always fine.
  govLinks: [
    { label: 'National Portal of India', href: 'https://www.india.gov.in/' },
    { label: 'Digital India', href: 'https://www.digitalindia.gov.in/' },
    { label: 'myScheme', href: 'https://www.myscheme.gov.in/' },
  ],
};

export const ownerContact = `${siteMeta.ownerName} <${siteMeta.ownerEmail}>`;
