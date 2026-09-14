const siteUrl = 'https://matkakingfatafat-bice.vercel.app'

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  }
}
