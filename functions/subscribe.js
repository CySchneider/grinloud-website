// Cloudflare Pages Function — proxy for Beehiiv subscription API
// Runs server-side, avoids CORS issues with direct browser→Beehiiv calls.
// Deploy env vars: BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://grinloud.com',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { email } = await context.request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const PUBLICATION_ID = context.env.BEEHIIV_PUBLICATION_ID;
    const API_KEY        = context.env.BEEHIIV_API_KEY;

    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'grinloud-website',
        }),
      }
    );

    const data = await res.json();

    if (res.status === 201 || res.status === 200) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
    } else if (res.status === 409) {
      return new Response(JSON.stringify({ already: true }), { status: 409, headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({ error: data }), { status: res.status, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://grinloud.com',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
