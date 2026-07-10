/**
 * Local stand-in for the numbers www fetches at build time
 * (GitHub API star count, Ashby jobs board). The page is fully static,
 * so these are checked-in values instead of network calls.
 */
const staticContent = {
  githubStars: 106000,
  jobsCount: 51,
  latestBlogPosts: [
    {
      title: 'Realtime: Broadcast from Database',
      description: 'Use Realtime Broadcast to scale sending database changes to clients.',
      url: '/blog/realtime-broadcast-from-database',
    },
    {
      title: 'Supabase Realtime: Broadcast and Presence Authorization',
      description: 'Secure Realtime Broadcast and Presence with Authorization rules.',
      url: '/blog/supabase-realtime-broadcast-and-presence-authorization',
    },
  ],
}

export default staticContent
