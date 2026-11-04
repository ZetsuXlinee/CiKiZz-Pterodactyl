import { randomBytes } from 'crypto';
import { Plan } from './plans';

const panelUrl = process.env.PTERO_PANEL_URL!.replace(/\/$/, ''); // Hapus garis miring di akhir URL
const apiKey = process.env.PTERO_APP_API_KEY!;

// Fungsi pembantu untuk memanggil API Pterodactyl
async function pteroFetch(endpoint: string, method: string, body: any) {
  const response = await fetch(`${panelUrl}/api/application/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.errors?.[0]?.detail || `Pterodactyl API Error: ${response.statusText}`);
  }
  return data;
}

export async function provisionAccount(params: {
  email: string;
  name: string;
  plan: Plan;
}) {
  const username = params.email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 20).toLowerCase();
  const password = randomBytes(8).toString('hex');

  // 1. Buat User Baru di Pterodactyl
  const userResponse = await pteroFetch('users', 'POST', {
    email: params.email,
    username,
    first_name: params.name.split(' ')[0] || 'Member',
    last_name: params.name.split(' ').slice(1).join(' ') || 'CiKiZz',
    password,
  });
  
  const user = userResponse.attributes;

  // 2. Buat Server Baru untuk User Tersebut
  const serverResponse = await pteroFetch('servers', 'POST', {
    name: `bot-${username}`,
    user: user.id,
    nest: Number(process.env.PTERO_NEST_ID || 1),
    egg: Number(process.env.PTERO_EGG_ID || 15),
    docker_image: process.env.PTERO_DOCKER_IMAGE || 'ghcr.io/parkervcp/yolks:nodejs_20',
    startup: process.env.PTERO_STARTUP || 'npm start',
    environment: { MAIN_FILE: 'index.js' },
    limits: {
      memory: params.plan.memory,
      swap: 0,
      disk: params.plan.disk,
      io: 500,
      cpu: params.plan.cpu,
    },
    feature_limits: { databases: 1, backups: 1, allocations: 1 },
  });

  const server = serverResponse.attributes;

  return { user, server, password, username };
}