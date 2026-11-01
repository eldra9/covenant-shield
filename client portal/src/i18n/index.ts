/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * i18next configuration for Covenant Shield Client Portal.
 * All user-facing strings are localized with support for text expansion.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        portalTitle: 'Covenant Shield Client Portal',
        overview: 'Overview',
        requests: 'Requests',
        cases: 'Cases',
        sites: 'Sites',
        account: 'Account',
        notifications: 'Notifications',
        security: 'Security & Access',
        signOut: 'Sign Out',
        hotlineLabel: '24/7 Operations Desk',
        eatTimezone: 'East Africa Time (EAT / UTC+3)',
        searchPlaceholder: 'Search by reference or keyword...',
        filterAll: 'All',
        loading: 'Loading portal records...',
        retry: 'Retry',
        restrictedPost: "Restricted post: You don't have access to this page. If you think you should, contact your administrator.",
        unauthorizedAccess: 'Access Restricted',
        backToDashboard: 'Return to Overview',
        onPostNow: 'On post now',
        nextShift: 'Next shift 18:00 EAT',
        downloadQuotation: 'Download Authorized Quotation (PDF)',
        officialResponse: 'Official Response',
        reopenCase: 'Reopen Case',
        daysRemaining: 'days remaining to reopen',
        hoursRemaining: 'hours remaining to reopen',
        expired: 'Reopen window expired',
        coverageToday: 'Your coverage today',
        openRequests: 'Open requests',
        openCases: 'Open cases',
        noOpenRecords: 'All posts and tickets are currently clear and in normal operational standing.',
        newRequestCTA: 'Log New Request',
        newFeedbackCTA: 'Report Issue / Feedback',
      },
      dashboard: {
        greetingMorning: 'Good morning',
        greetingAfternoon: 'Good afternoon',
        greetingEvening: 'Good evening',
        greetingNight: 'Good night',
        conciergeSub: 'Here is your current operational posture across all authorized installations.',
        activeSites: 'Authorized Sites',
        openRequestsMetric: 'Open Requests',
        openCasesMetric: 'Open Cases',
        unreadNotices: 'Unread Notices',
        activeGuardsTotal: 'Guards on Duty',
      },
      sites: {
        title: 'Authorized Service Sites',
        subtitle: 'Physical facilities under current Covenant Shield protection contracts.',
        postCount: 'Guards Posted',
        shiftSupervisor: 'Duty Supervisor',
        coverageHours: 'Contracted Coverage',
        viewDetails: 'View Site Protocol',
        recentHandover: 'Last Shift Handover',
        handoverStatus: 'Status Report',
        sevenDaySchedule: '7-Day Coverage Schedule',
      },
      requests: {
        title: 'Service Requests',
        subtitle: 'Escorts, perimeter audits, tactical patrols, and specialized security deployments.',
        createNew: 'New Service Request',
        refHeader: 'Reference',
        typeHeader: 'Service Type',
        siteHeader: 'Site Location',
        priorityHeader: 'Priority',
        statusHeader: 'Status',
        submittedHeader: 'Date (EAT)',
        quotationHeader: 'Quotation',
        actionsHeader: 'Actions',
        viewTicket: 'View Ticket',
        approveQuote: 'Approve Quotation',
        requestCancellation: 'Request Cancellation',
        detailsTitle: 'Service Request Details',
        quotationSentBanner: 'Formal Quotation Released for Review',
        acceptedBanner: 'Quotation Formally Accepted',
      },
      cases: {
        title: 'Support Cases & Feedback',
        subtitle: 'Report operational incidents, log complaints, or request security consultations.',
        logNew: 'Log New Case / Feedback',
        ticketRef: 'Ticket Reference',
        subject: 'Subject',
        category: 'Category',
        status: 'Status',
        opened: 'Opened (EAT)',
        resolution: 'Resolution Details',
        conversationHeader: 'Concierge Dispatch Thread',
        replyPlaceholder: 'Compose a message to your operations commander...',
        sendReply: 'Send Reply',
        caseClosedNotice: 'This case has been resolved and closed.',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
