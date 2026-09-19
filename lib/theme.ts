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
      'Photography, cinema & creator gear',
      'Explore cameras, lenses, audio and lighting',
    ],
    autoRotate: true,
    rotateInterval: 5000,
  },

  cart: {
    freeShippingThreshold: 0,
    trustCopy: 'Shipping and payment options are confirmed at checkout',
  },

  badges: {
    saleBackground: 'bg-red-600',
    saleText: 'text-white',
    position: 'corner' as const,
  },

  trustBadges: [
    { icon: 'Lock', label: 'Secure checkout' },
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
