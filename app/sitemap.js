const siteUrl = 'https://matkakingfatafat-bice.vercel.app'

export default function sitemap() {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 }
  ]
}
