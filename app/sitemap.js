const siteUrl = 'https://matkakingfatafat-bice.vercel.app'

export default function sitemap() {
  const now = new Date()
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/#today`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/#old`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/#patti-list`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/#chart`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 }
  ]
}
