export async function GET() {
  const publisherId = process.env.ADSENSE_PUBLISHER_ID
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Add your Google AdSense publisher ID here after approval.\n'

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  })
}
