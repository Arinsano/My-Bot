import { verifyKey } from 'discord-interactions';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const signature = req.headers.get('x-signature-ed25519');
  const timestamp = req.headers.get('x-signature-timestamp');
  const body = await req.text(); // NOTE: must read body as text!

  const isValidRequest = verifyKey(body, signature, timestamp, PUBLIC_KEY);

  if (!isValidRequest) {
    return new Response('Bad request signature.', { status: 401 });
  }

  const json = JSON.parse(body);

  if (json.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), { status: 200 });
  }

  // handle other types here...
  return new Response('ok', { status: 200 });
}
