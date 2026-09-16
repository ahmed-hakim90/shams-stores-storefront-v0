import { LegalDocumentLayout } from '@/components/shams/patterns'

const sections = [
  {
    id: 'information-we-collect',
    title: '1. Information we collect',
    content: (
      <p>
        We collect information you provide directly — such as your name, phone
        number, delivery address and email when you place an order or contact
        us. We also automatically collect certain technical data including your
        IP address, browser type and pages visited on our website.
      </p>
    ),
  },
  {
    id: 'how-we-use-data',
    title: '2. How we use your data',
    content: (
      <p>
        Your data is used to process and deliver orders, communicate about your
        purchases, provide customer support, improve our website and services,
        and comply with legal obligations. We never sell your personal data to
        third parties.
      </p>
    ),
  },
  {
    id: 'data-sharing',
    title: '3. Data sharing',
    content: (
      <p>
        We share your information only with trusted partners necessary to
        fulfill your order — delivery companies, payment processors and warranty
        service providers. All partners are bound by confidentiality agreements.
        We may disclose data when required by law.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: '4. Data retention',
    content: (
      <p>
        We retain your personal data only for as long as necessary to fulfill
        the purposes for which it was collected, or as required by Egyptian law.
        Order records are kept for accounting and warranty purposes.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: '5. Your rights',
    content: (
      <p>
        You have the right to access, correct or delete your personal data at
        any time. You may also opt out of marketing communications. To exercise
        any of these rights, contact us via phone or WhatsApp.
      </p>
    ),
  },
  {
    id: 'security',
    title: '6. Security',
    content: (
      <p>
        We implement industry-standard security measures to protect your data.
        Payment information is processed through PCI-compliant providers and is
        never stored on our servers in plain text.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: '7. Cookies',
    content: (
      <p>
        Our website uses cookies to enhance your browsing experience, remember
        your preferences and analyze site traffic. See our{' '}
        <a href="/cookies" className="text-brand-ink underline hover:text-brand">
          Cookie Policy
        </a>{' '}
        for details on what cookies we use and how to manage them.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '8. Changes to this policy',
    content: (
      <p>
        We may update this privacy policy from time to time. Any changes will be
        posted on this page with an updated revision date. We encourage you to
        review this policy periodically.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '9. Contact us',
    content: (
      <p>
        If you have questions about this privacy policy or your data, reach out
        at our Downtown Cairo showroom (
        <a href="tel:0223901870" className="text-brand-ink underline hover:text-brand">
          022 390 1870
        </a>
        ) or via WhatsApp (
        <a href="https://wa.me/201011331666" className="text-brand-ink underline hover:text-brand">
          010 1133 1666
        </a>
        ).
      </p>
    ),
  },
]

export function PrivacyPageV2() {
  return (
    <LegalDocumentLayout
      title="Privacy policy"
      lastUpdated="September 2026"
      sections={sections}
    />
  )
}
