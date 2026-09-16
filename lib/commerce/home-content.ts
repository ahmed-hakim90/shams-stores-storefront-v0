export interface GearGuide {
  id: string
  title: string
  eyebrow: string
  description: string
  destination: string
  featured: boolean
  sortOrder: number
  enabled: boolean
}

export interface BuyingQuestion {
  id: string
  question: string
  hint: string
  destination: string
  sortOrder: number
  enabled: boolean
}

export const gearGuides: GearGuide[] = [
  {
    id: 'guide-camera-choice',
    title: 'Which camera is right for you?',
    eyebrow: 'Buying guide',
    description:
      'Mirrorless, cinema or compact — understand the trade-offs before you commit to a system.',
    destination: '/c/cameras',
    featured: true,
    sortOrder: 0,
    enabled: true,
  },
  {
    id: 'guide-lens-choice',
    title: 'How to choose the right lens',
    eyebrow: 'Buying guide',
    description:
      'Mount, focal length and aperture — the three decisions that shape every frame.',
    destination: '/c/lens',
    featured: false,
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'guide-first-setup',
    title: 'Build your first creator setup',
    eyebrow: 'Getting started',
    description:
      'Camera, audio, lighting and support — the four pillars of a working kit.',
    destination: '/bundles',
    featured: false,
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 'guide-memory-cards',
    title: 'Choosing the right memory card',
    eyebrow: 'Buying guide',
    description:
      'Speed classes, capacity and reliability — what matters for stills, 4K and high-frame-rate video.',
    destination: '/c/memory-cards',
    featured: false,
    sortOrder: 3,
    enabled: true,
  },
]

export const buyingQuestions: BuyingQuestion[] = [
  {
    id: 'q-start-camera',
    question: 'What camera should I start with?',
    hint: 'Camera discovery',
    destination: '/c/cameras',
    sortOrder: 0,
    enabled: true,
  },
  {
    id: 'q-lens-compat',
    question: 'Which lens works with my camera?',
    hint: 'Lens & system guide',
    destination: '/c/lens',
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'q-vlogging',
    question: 'What do I need for vlogging?',
    hint: 'Vlogging setup',
    destination: '/w/pro-video-vlogging',
    sortOrder: 2,
    enabled: true,
  },
  {
    id: 'q-microphone',
    question: 'Which microphone should I choose?',
    hint: 'Audio discovery',
    destination: '/c/rode-audio',
    sortOrder: 3,
    enabled: true,
  },
  {
    id: 'q-studio',
    question: 'How do I build a complete studio?',
    hint: 'Studio setup',
    destination: '/w/pro-studio',
    sortOrder: 4,
    enabled: true,
  },
]

export function getEnabledGearGuides(): GearGuide[] {
  return gearGuides
    .filter((g) => g.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getEnabledBuyingQuestions(): BuyingQuestion[] {
  return buyingQuestions
    .filter((q) => q.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
