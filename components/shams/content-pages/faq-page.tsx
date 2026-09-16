import { PageHero, TopicNavigation, FaqGroups } from '@/components/shams/patterns'
import { HelpCircle } from 'lucide-react'

const TOPICS = [
  { key: 'orders', label: 'Orders & delivery' },
  { key: 'returns', label: 'Returns & exchanges' },
  { key: 'payment', label: 'Payment & installments' },
  { key: 'warranty', label: 'Warranty & repairs' },
  { key: 'products', label: 'Product information' },
  { key: 'account', label: 'Account & wishlist' },
]

const FAQ_GROUPS = [
  {
    id: 'orders',
    title: 'Orders & delivery',
    items: [
      {
        question: 'How do I track my order?',
        answer:
          'Use our Track Order page with your order number and email address. You can also contact us by phone or WhatsApp for live updates.',
      },
      {
        question: 'When will my order arrive?',
        answer:
          'Cairo orders typically arrive within 1–3 business days. Other governorates take 3–5 business days. Orders are processed Saturday through Thursday, 10 AM – 10 PM.',
      },
      {
        question: 'Is delivery free?',
        answer:
          'Yes, delivery is free for orders over EGP 5,000. For orders below that threshold, delivery fees are calculated at checkout based on your location.',
      },
      {
        question: 'Can I pick up my order from a store?',
        answer:
          'Yes. If the item is in stock, you can pick up from our Downtown or Heliopolis showroom the same day. Select store pickup at checkout.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & exchanges',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'Unopened, boxed gear may be returned or exchanged within 14 days of delivery. Items must be in their original condition with all packaging and accessories.',
      },
      {
        question: 'Can I return custom-built or special-order items?',
        answer:
          'Custom-built or special-order items are non-returnable unless they are defective. Contact us for warranty service on defective items.',
      },
      {
        question: 'How do I start a return?',
        answer:
          'Contact us via phone (022 392 9204) or WhatsApp (010 2000 1604) to initiate a return. We will confirm eligibility and provide instructions.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment & installments',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept Visa, Mastercard, InstaPay, ValU, Fawry, bank transfer and cash on delivery.',
      },
      {
        question: 'Do you offer installment plans?',
        answer:
          'Yes, installment plans are available for up to 24 months through participating banks. Eligibility and terms depend on the bank. Contact us for details about current offers.',
      },
      {
        question: 'Are prices inclusive of tax?',
        answer:
          'All prices are displayed in Egyptian Pounds (EGP) and include applicable taxes unless stated otherwise.',
      },
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty & repairs',
    items: [
      {
        question: 'What warranty comes with products?',
        answer:
          'All products carry the manufacturer\'s warranty applicable in Egypt. Shams Stores provides additional support for warranty claims and repairs.',
      },
      {
        question: 'What does the warranty not cover?',
        answer:
          'Warranty does not cover damage caused by misuse, accidents or unauthorized modifications. Proof of purchase is required for all warranty service.',
      },
      {
        question: 'How do I file a warranty claim?',
        answer:
          'Contact us via WhatsApp (010 2000 1604) with your order number and a description of the issue. Our team will guide you through the process.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Product information',
    items: [
      {
        question: 'Are your products genuine?',
        answer:
          'Yes. Shams Stores is an authorized reseller for every brand we carry. No grey imports — only products sourced through official channels with full local warranty.',
      },
      {
        question: 'Can I try gear before buying?',
        answer:
          'Visit our Downtown or Heliopolis showroom to hold the gear, test the feel and compare options side by side before you commit.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & wishlist',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the account icon in the header and select Register. You can also check out as a guest without creating an account.',
      },
      {
        question: 'How does the wishlist work?',
        answer:
          'Click the heart icon on any product to save it to your wishlist. If you are logged in, your wishlist is saved across devices. You can also share your wishlist with others.',
      },
    ],
  },
]

export function FaqPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="FAQ"
        eyebrowIcon={HelpCircle}
        title="Frequently asked questions"
        description="Quick answers to common questions about orders, shipping, returns, payments and more."
        compact
      />

      <TopicNavigation topics={TOPICS} />

      <section className="shams-container py-10 sm:py-14">
        <FaqGroups groups={FAQ_GROUPS} />
      </section>
    </main>
  )
}
