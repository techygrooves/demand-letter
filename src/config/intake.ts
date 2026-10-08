/**
 * Intake form configuration: options, limits and submission settings.
 *
 * Submission is configured with environment variables at build time
 * (see .env.example). Until a provider is configured the form says plainly
 * that nothing has been sent and offers phone/email instead.
 */

export const disputeOptions = [
  { value: 'unpaid-debt', label: 'Unpaid debt or money owed' },
  { value: 'breach-of-contract', label: 'Breach of contract' },
  { value: 'landlord-tenant', label: 'Landlord-tenant dispute' },
  { value: 'property-real-estate', label: 'Property or real estate dispute' },
  { value: 'consumer', label: 'Consumer complaint' },
  { value: 'business', label: 'Business dispute' },
  { value: 'contractor-construction', label: 'Contractor or construction issue' },
  { value: 'employment', label: 'Employment-related dispute' },
  { value: 'insurance-reimbursement', label: 'Insurance or reimbursement dispute' },
  { value: 'other', label: 'Other civil matter' },
] as const;

export const deadlineOptions = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
  { value: 'unsure', label: 'Not sure' },
] as const;

export const usStates = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ['OUTSIDE_US', 'Outside the United States'],
] as const;

/** Character limits, enforced with maxlength and in validation. */
export const limits = {
  name: 120,
  email: 254,
  phone: 30,
  opposingParty: 160,
  opposingLocation: 120,
  amount: 15,
  description: { min: 30, max: 4000 },
  resolution: { min: 5, max: 1500 },
  deadlineDetails: 500,
} as const;

/** Minimum time (ms) between page load and submit; faster submissions are treated as automated. */
export const minFillTimeMs = 4000;

export const steps = [
  { id: 'contact', title: 'Contact Details', short: 'Contact' },
  { id: 'dispute-type', title: 'Type of Dispute', short: 'Dispute' },
  { id: 'details', title: 'Dispute Information', short: 'Details' },
  { id: 'review', title: 'Review and Submit', short: 'Review' },
] as const;
