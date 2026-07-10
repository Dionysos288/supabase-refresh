export type CustomerStoryType = {
  type: 'Customer Story'
  title: string
  description: string
  organization: string
  imgUrl: string
  url: string
  ctaText?: string
}

// The nav's ProductDropdown renders only the first story.
export const data: CustomerStoryType[] = [
  {
    type: 'Customer Story',
    title: 'Cofounder builds autonomous companies on Supabase',
    description:
      "Cofounder gives every customer an entire engineering, sales, marketing, support, and product team made of agents. Supabase for Platforms gives Cofounder the database platform to run an entire software company on every customer's behalf, from day one.",
    organization: 'Cofounder',
    imgUrl: 'images/customers/logos/cofounder.png',
    url: '/customers/cofounder',
    ctaText: 'View story',
  },
]

export default data
