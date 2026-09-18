export const theme = {
  radius: {
    control: '8px',
    card: '8px',
    editorial: '8px',
  },

  glass: {
    opacity: 0.85,
    blur: 'xl',
    saturation: 150,
  },

  announcement: {
    enabled: true,
    messages: [
      'Free shipping on orders over 5,000 EGP',
      '15% off cameras — code: SHAMS15',
      'Installments without interest up to 12 months',
    ],
    autoRotate: true,
    rotateInterval: 5000,
  },

  cart: {
    freeShippingThreshold: 5000,
    trustCopy: 'Secure checkout \u00b7 Free returns within 14 days',
  },

  badges: {
    saleBackground: 'bg-red-600',
    saleText: 'text-white',
    position: 'corner' as const,
  },

  trustBadges: [
    { icon: 'Lock', label: 'Secure checkout' },
    { icon: 'RefreshCw', label: '14-day returns' },
    { icon: 'ShieldCheck', label: 'Official warranty' },
  ],

  newsletter: {
    heading: 'Stay in the loop',
    subtitle: 'New arrivals, exclusive offers, and creator tips.',
  },

  stagger: {
    gridDelay: 50,
    railDelay: 40,
    duration: 350,
  },
} as const
