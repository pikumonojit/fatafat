const siteUrl = 'https://matkakingfatafat-bice.vercel.app'

export default function sitemap() {
  const now = new Date()
  return [
    { url: siteUrl + '/', lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: siteUrl + '/today-result', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: siteUrl + '/old-results', lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: siteUrl + '/all-results', lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: siteUrl + '/patti-list', lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: siteUrl + '/about', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: siteUrl + '/contact', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: siteUrl + '/privacy-policy', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: siteUrl + '/terms', lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: siteUrl + '/disclaimer', lastModified: now, changeFrequency: 'yearly', priority: 0.4 }
  ]
}
