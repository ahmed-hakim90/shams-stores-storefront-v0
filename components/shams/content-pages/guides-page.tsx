import { PageHero, GuideIndex } from '@/components/shams/patterns'
import {
  Camera,
  Film,
  Mic,
  Lightbulb,
  Users,
  Package,
} from 'lucide-react'

const GUIDES = [
  {
    title: 'Getting started with photography',
    description:
      'Camera bodies, lenses and essential accessories for still photography.',
    category: 'Photography',
    href: '/categories',
    icon: Camera,
  },
  {
    title: 'Filmmaking & video production',
    description:
      'Cinema cameras, lenses, rigs and post-production tools for video.',
    category: 'Cinema',
    href: '/categories',
    icon: Film,
  },
  {
    title: 'Audio for creators',
    description:
      'Microphones, recorders and monitoring for studio and field recording.',
    category: 'Audio',
    href: '/categories',
    icon: Mic,
  },
  {
    title: 'Lighting setups',
    description:
      'Strobe, LED and continuous lighting — modifiers and control accessories.',
    category: 'Lighting',
    href: '/categories',
    icon: Lightbulb,
  },
  {
    title: 'Building your first creator setup',
    description:
      'Step-by-step guidance for vlogging, podcasting and content creation workflows.',
    category: 'Workflows',
    href: '/categories',
    icon: Users,
  },
  {
    title: 'Accessories & essentials',
    description:
      'Bags, tripods, batteries, memory cards and the small items that make a big difference.',
    category: 'Accessories',
    href: '/categories',
    icon: Package,
  },
]

export function GuidesPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <PageHero
        eyebrow="Guides"
        eyebrowIcon={Camera}
        title="Guides & learning"
        description="Explore gear by category, workflow and use case. Find the right setup for your creative work."
        compact
      />

      <section className="shams-container py-10 sm:py-14">
        <GuideIndex guides={GUIDES} />
      </section>
    </main>
  )
}
