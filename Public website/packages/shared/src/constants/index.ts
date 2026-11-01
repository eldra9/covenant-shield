export const BRAND = {
  name: 'Covenant Shield',
  fullName: 'Covenant Shield Security Services',
  tagline: 'Vigilance, Integrity & Sovereign Protection',
  phone: '+1 (800) 555-SHIELD',
  directPhone: '+1 (555) 724-4353',
  emergencyHotline: '+1 (800) 911-SHIELD (24/7 Operations Control)',
  email: 'operations@covenantshield.com',
  dispatchEmail: 'dispatch@covenantshield.com',
  address: '100 Citadel Way, Suite 400, Financial District',
  cityStateZip: 'Metropolis, NY 10005',
  hours: '24/7 Operations Command & Dispatch',
};

export const SERVICE_CATEGORIES = [
  {
    id: 'STATIC_GUARDING',
    title: 'Static Guarding',
    shortDescription: 'Uniformed and tactical sentry defense for corporate headquarters, industrial yards, and diplomatic residential properties.',
    fullDescription: 'Our certified stationary security personnel undergo strict vetting and tactical access control training. Services include perimeter monitoring, visitor screening, vehicle log inspection, and rapid deterrence protocols.',
    features: [
      'Uniformed tactical presence or discrete corporate attire',
      'Electronic visitor screening and biometric badge verification',
      'Continuous gatehouse and perimeter post observation',
      'Real-time incident reporting via encrypted digital logbooks'
    ],
    recommendedFor: 'Corporate offices, commercial complexes, gated communities, construction sites.'
  },
  {
    id: 'EVENT_SECURITY',
    title: 'Event Security',
    shortDescription: 'Comprehensive crowd management, ingress/egress screening, and defensive logistics for high-profile gatherings.',
    fullDescription: 'From corporate summits and shareholders assemblies to private galas and high-capacity entertainment venues, we coordinate security perimeters, queue flow, emergency egress routes, and rapid-response tactical teams.',
    features: [
      'Metal detection, bag inspection, and perimeter checkpoints',
      'Crowd flow engineering and de-escalation specialists',
      'Liaison with local municipal law enforcement and EMS',
      'Undercover spotters and discrete asset tracking'
    ],
    recommendedFor: 'Conferences, VIP galas, private product reveals, sports venues.'
  },
  {
    id: 'VIP_ESCORT',
    title: 'VIP Protection & Escort',
    shortDescription: 'Close protection officers (CPOs) and armored executive convoys for executives, dignitaries, and at-risk individuals.',
    fullDescription: 'Our Executive Close Protection team is comprised of former specialized military and law enforcement operatives certified in defensive evasive driving, counter-surveillance, threat assessment, and route reconnaissance.',
    features: [
      'Armed and unarmed certified close protection officers',
      'Advance route reconnaissance and safe haven coordination',
      'Low-profile or high-visibility motorcade escorting',
      'Secure travel logistics and air-to-ground arrival coordination'
    ],
    recommendedFor: 'C-suite executives, visiting dignitaries, high-net-worth families, public figures.'
  },
  {
    id: 'PATROL_SERVICES',
    title: 'Patrol Services',
    shortDescription: 'Marked mobile cruisers and rapid-response tactical units conducting randomized inspections and alarm verification.',
    fullDescription: 'Covenant Shield mobile patrol units provide high-visibility deterrence through scheduled and randomised vehicle patrols, lock-up checks, keyholding, and instantaneous emergency response trigger dispatch.',
    features: [
      'GPS-verified electronic NFC checkpoint logging',
      'Rapid alarm dispatch and intrusion verification',
      'Facility lock, unlock, and interior search patrols',
      'Dashcam and bodycam recorded evidence preservation'
    ],
    recommendedFor: 'Multi-tenant business parks, retail shopping strips, warehouses, campus facilities.'
  },
  {
    id: 'CCTV_MONITORING',
    title: 'CCTV & Remote Monitoring',
    shortDescription: 'Round-the-clock remote video surveillance, AI intrusion analytics, and proactive two-way audio intervention.',
    fullDescription: 'Operated from our 24/7 central operations command center, our surveillance analysts monitor real-time video feeds with thermal detection, optical tripwires, and direct loudspeaker deterrent capabilities.',
    features: [
      '24/7 live video monitoring by accredited analysts',
      'AI thermal and optical motion tripwire alerts',
      'Two-way audio challenge speaker intervention',
      'Immediate tactical dispatch and priority police notification'
    ],
    recommendedFor: 'Car dealerships, remote infrastructure, logistics distribution hubs, estate perimeters.'
  },
  {
    id: 'OTHER_SECURITY',
    title: 'Custom Security Solutions',
    shortDescription: 'Tailored risk assessments, maritime security, strike mitigation, and specialized asset custody.',
    fullDescription: 'When standard security frameworks are insufficient, Covenant Shield designs bespoke defense and compliance architectures addressing unique logistical, geographical, or regulatory requirements.',
    features: [
      'Threat vulnerability audits and risk matrix analysis',
      'High-value transit and armored custody solutions',
      'Labor dispute, picket-line, and facility shutdown mitigation',
      'Disaster emergency continuity and crisis intervention'
    ],
    recommendedFor: 'Unique infrastructure, high-value asset transport, enterprise contingency.'
  }
] as const;

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  STATIC_GUARDING: 'Static Guarding',
  EVENT_SECURITY: 'Event Security',
  VIP_ESCORT: 'VIP Protection / Escort',
  PATROL_SERVICES: 'Mobile Patrol Services',
  CCTV_MONITORING: 'CCTV & Remote Monitoring',
  OTHER_SECURITY: 'Specialized / Other Security',
};

export const COVERAGE_LABELS: Record<string, string> = {
  DAY: 'Day Shift (8-12 Hours)',
  NIGHT: 'Night Shift (8-12 Hours)',
  TWENTY_FOUR_HOUR: '24-Hour Continuous Sentry',
};

export const DURATION_LABELS: Record<string, string> = {
  ONE_OFF: 'One-off Event / Temporary',
  ONE_MONTH: '1 Month Contract',
  THREE_MONTHS: '3 Months Contract',
  SIX_MONTHS: '6 Months Contract',
  TWELVE_MONTHS: '12 Months (Annual Master Agreement)',
};

export const REQUEST_STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  NEW: { label: 'New / Intake Logged', color: 'bg-blue-100 text-blue-900 border-blue-300', step: 1 },
  RECEIVED: { label: 'New / Intake Logged', color: 'bg-blue-100 text-blue-900 border-blue-300', step: 1 },
  UNDER_REVIEW: { label: 'Operations Threat Review', color: 'bg-amber-100 text-amber-900 border-amber-300', step: 2 },
  SITE_ASSESSMENT_SCHEDULED: { label: 'Site Assessment Scheduled', color: 'bg-purple-100 text-purple-900 border-purple-300', step: 3 },
  QUOTATION_SENT: { label: 'Quotation & SLA Prepared', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', step: 4 },
  PROPOSAL_PREPARED: { label: 'Quotation & SLA Prepared', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', step: 4 },
  ACCEPTED: { label: 'Terms Accepted / Mobilizing', color: 'bg-teal-100 text-teal-900 border-teal-300', step: 5 },
  CONTRACT_ACTIVE: { label: 'Contract Active / Deployed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', step: 6 },
  DEPLOYED: { label: 'Contract Active / Deployed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', step: 6 },
  AMENDMENT_REQUESTED: { label: 'Amendment Requested', color: 'bg-orange-100 text-orange-900 border-orange-300', step: 3 },
  REJECTED: { label: 'Not Authorized / Declined', color: 'bg-rose-100 text-rose-900 border-rose-300', step: 0 },
  CANCELLED: { label: 'Cancelled by Requestor', color: 'bg-gray-200 text-gray-800 border-gray-300', step: 0 },
  CLOSED: { label: 'Closed / Completed', color: 'bg-gray-100 text-gray-800 border-gray-200', step: 7 },
};

export const CASE_CATEGORY_LABELS: Record<string, string> = {
  COMPLAINT: 'Formal Complaint',
  COMPLIMENT: 'Commendation / Compliment',
  SUGGESTION: 'Service Improvement Suggestion',
  GENERAL_FEEDBACK: 'General Client Feedback',
};

export const CASE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  LOGGED: { label: 'Logged into Oversight Register', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  INVESTIGATING: { label: 'Under Supervisory Review', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  ACTION_PENDING: { label: 'Action & Remediation Assigned', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  RESOLVED: { label: 'Resolved & Case Closed', color: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Archived', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};
