import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

const commands = [
  {
    name: 'mr-review',
    description: 'Create a merge request template via modal',
  },
  {
    name: 'ac-review',
    description: 'Create an AC review booking via modal',
  },
];

async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

  for (const cmd of commands) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cmd),
    });
    const data = await resp.json();
    console.log('Registered command:', data);
  }
}

registerCommands().catch((err) => {
  console.error('Error registering commands:', err);
});
