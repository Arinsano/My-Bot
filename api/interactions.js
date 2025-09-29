import { verifyKey } from 'discord-interactions';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const body = await req.text(); // Must read as text, not JSON!

  const isValid = verifyKey(body, signature, timestamp, PUBLIC_KEY);
  if (!isValid) {
    return new Response('Bad request signature', { status: 401 });
  }

  const jsonBody = JSON.parse(body);

  if (jsonBody.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // You can handle other interactions here later

  return new Response('Unhandled interaction', { status: 400 });
}
