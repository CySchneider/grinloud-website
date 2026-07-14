// Cloudflare Pages Function — SPA fallback for /pick/*  and /radar/*.
//
// scripts/generate-static-pages.js only bakes a static index.html for picks
// that were already public *at the last deploy*. A pick that went live after
// that (e.g. today's, since deploy.yml only runs on push — there's no daily
// rebuild) has no matching file on disk, so the platform's default static
// handling 404s on a direct load or a hard refresh, even though the SPA can
// render it fine client-side (App.jsx reads the date straight from the URL).
//
// context.next() first lets Pages serve the real static file if one exists,
// so dates that do have a generated page keep their own SEO/OG tags. Only
// when that lookup 404s do we fall back to the app shell at 200, so the
// client-side router can take over.
export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);
  if (!/^\/(pick|radar)\//.test(pathname)) return context.next();

  const response = await context.next();
  if (response.status !== 404) return response;

  return context.env.ASSETS.fetch(new URL('/', context.request.url));
}
