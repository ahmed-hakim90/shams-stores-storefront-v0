import { getHeroCampaign } from '@/lib/commerce/live/merchandising'
import { HeroCascade } from '@/components/shams/marketing'
import { ProductSpotlight } from '@/components/shams/marketing/merchandising-sections'

export async function LiveHero() {
  const campaign = await getHeroCampaign().catch(() => null)
  if (!campaign) return <ProductSpotlight />
  return <HeroCascade campaign={campaign} />
}
