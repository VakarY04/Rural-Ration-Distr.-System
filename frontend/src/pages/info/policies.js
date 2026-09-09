import { siteMeta } from '../../config/siteMeta';

// Plain-language policy library for a personal civic project. Each document
// is data (not JSX) so the PolicyPage renderer stays tiny and new documents
// are a 10-line addition. Ownership flows from siteMeta — one edit on handover.
const year = new Date().getFullYear();

export const POLICIES = {
  terms: {
    title: 'Terms of Use',
    intro: 'The ground rules for using this portal.',
    sections: [
      {
        h: 'What this is',
        p: [
          `${siteMeta.projectName} is an independent civic project maintained by ${siteMeta.ownerName}. It is not a government website and does not issue ration cards or entitlements — it helps citizens organise their household information and collection bookings.`,
        ],
      },
      {
        h: 'Your responsibilities',
        p: [
          'Provide accurate household details. Do not submit anyone else\u2019s personal data without consent. Do not misuse the feedback or grievance tools (spam and abuse may be blocked).',
        ],
      },
      {
        h: 'Availability',
        p: [
          'The service is provided as-is and may change or pause without notice. Your data can be corrected on the Family Profile page or permanently deleted there at any time.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'What is collected, why, and your rights over it.',
    sections: [
      {
        h: 'Data collected',
        p: [
          'Account: name, email, phone and an optional profile picture. Household: ration card number, head of family, address and family members you enter. Bookings: the slots you schedule. Feedback: what you send.',
        ],
      },
      {
        h: 'Why',
        p: [
          'Solely to operate the portal: quota estimates, distributor assignment, slot booking and responding to you. Nothing is sold, rented or shared for marketing.',
        ],
      },
      {
        h: 'Your control',
        p: [
          `You can edit everything on the Family Profile page, and the Danger Zone there permanently deletes your account and bookings. Questions: contact ${siteMeta.ownerEmail}.`,
        ],
      },
    ],
  },
  accessibility: {
    title: 'Accessibility Statement',
    intro: `Commitment to usable access for everyone, following GIGW 3.0 / WCAG 2.1 AA.`,
    sections: [
      {
        h: 'What is provided',
        p: [
          'Keyboard-only operation with visible focus and skip links, a text-size and contrast toolbar on every page, labels on all icon-only buttons, and Noto Sans type that supports Hindi and regional scripts.',
        ],
      },
      {
        h: 'Known limits',
        p: [
          'The interface is available in English and Hindi via the header toggle, with Noto Sans Devanagari support; map tiles come from OpenStreetMap with text alternatives in the delivery panel. An automated accessibility scan is still pending before any official submission.',
        ],
      },
      {
        h: 'Report a barrier',
        p: [
          `Faced an accessibility problem? Send Feedback describing your device, browser and what blocked you — access issues are treated as high priority by ${siteMeta.ownerName}.`,
        ],
      },
    ],
  },
  copyright: {
    title: 'Copyright Policy',
    intro: 'Who owns what here.',
    sections: [
      {
        h: 'Ownership',
        p: [
          `© ${year} ${siteMeta.ownerName}. The portal's code, design and original text are the author's work. Citizen data entered by users remains theirs. Third-party assets (map tiles © OpenStreetMap contributors, Noto Sans under the SIL Open Font License) belong to their owners.`,
        ],
      },
      {
        h: 'Reuse',
        p: [
          'Government bodies interested in adopting this project may contact the owner to discuss licensing or handover, including transfer of the codebase and content.',
        ],
      },
      {
        h: 'Report infringement',
        p: [
          `If something here violates your copyright, write to ${siteMeta.ownerEmail} with the URL and proof of ownership for prompt removal.`,
        ],
      },
    ],
  },
  archival: {
    title: 'Content Review & Archival Policy',
    intro: 'How content stays fresh and who is accountable.',
    sections: [
      {
        h: 'Owner (Web Information Manager)',
        p: [
          `${siteMeta.ownerName} (${siteMeta.ownerEmail}) is accountable for content accuracy, review cycles and archival — the single point of contact GIGW requires.`,
        ],
      },
      {
        h: 'Review cycle',
        p: [
          'Citizen-facing guides and helpline numbers are reviewed quarterly; quota rules and slot windows follow the documented entitlement logic and update with each release.',
        ],
      },
      {
        h: 'Archival',
        p: [
          'Expired announcements, past slots and superseded policy versions are removed from live pages and retained in release history, so visitors never act on outdated information.',
        ],
      },
    ],
  },
};

export const POLICY_KEYS = Object.keys(POLICIES);
