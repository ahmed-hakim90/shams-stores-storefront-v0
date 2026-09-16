import { LegalDocumentLayout } from '@/components/shams/patterns'

const sections = [
  {
    id: 'general',
    title: '1. General information',
    content: (
      <p>
        Shams Stores (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
        as a retail business specializing in photography, cinema and creator
        equipment. All purchases are subject to product availability and
        acceptance. We reserve the right to refuse or cancel any order at our
        discretion.
      </p>
    ),
  },
  {
    id: 'pricing-payment',
    title: '2. Pricing & payment',
    content: (
      <p>
        All prices are displayed in Egyptian Pounds (EGP) and include applicable
        taxes unless stated otherwise. We accept Visa, Mastercard, InstaPay,
        bank transfer and cash on delivery. Installment plans are available
        through participating banks and are subject to eligibility. Prices may
        change without notice; however, confirmed orders will be honored at the
        price at the time of purchase.
      </p>
    ),
  },
  {
    id: 'orders-delivery',
    title: '3. Orders & delivery',
    content: (
      <p>
        Orders are processed during business hours (Saturday through Thursday,
        10 AM – 10 PM). Delivery times vary by location — Cairo orders typically
        arrive within 1–3 business days, and other governorates within 3–5
        business days. Free delivery is available for orders over EGP 5,000.
        Risk of loss passes to you upon delivery.
      </p>
    ),
  },
  {
    id: 'returns',
    title: '4. Returns & exchanges',
    content: (
      <p>
        Unopened, boxed gear may be returned or exchanged within 14 days of
        delivery. Items must be in their original condition with all packaging
        and accessories. Custom-built or special-order items are non-returnable
        unless defective. Contact us via phone or WhatsApp to initiate a return.
      </p>
    ),
  },
  {
    id: 'warranty',
    title: '5. Warranty',
    content: (
      <p>
        All products carry the manufacturer&apos;s warranty applicable in Egypt.
        Shams Stores provides additional support for warranty claims and repairs.
        Warranty does not cover damage caused by misuse, accidents or
        unauthorized modifications. Proof of purchase is required for all
        warranty service.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: '6. Intellectual property',
    content: (
      <p>
        All content on this website — including text, images, logos and design —
        is the property of Shams Stores or its licensors. Reproduction,
        distribution or modification without written permission is prohibited.
      </p>
    ),
  },
  {
    id: 'liability',
    title: '7. Limitation of liability',
    content: (
      <p>
        Shams Stores is not liable for indirect, incidental or consequential
        damages arising from the use of products purchased. Our total liability
        is limited to the purchase price of the product in question.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '8. Contact',
    content: (
      <p>
        For questions about these terms, contact us at our Downtown Cairo
        showroom (
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

export function TermsPageV2() {
  return (
    <LegalDocumentLayout
      title="Terms & conditions"
      lastUpdated="September 2026"
      sections={sections}
    />
  )
}
