const siteUrl = 'https://matkakingfatafat-bice.vercel.app'

export default function sitemap() {
  const now = new Date()
  return [
    { url: siteUrl + '/', lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: siteUrl + '/today-result', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: siteUrl + '/old-results', lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: siteUrl + '/patti-list', lastModified: now, changeFrequency: 'weekly', priority: 0.7 }
  ]
}
