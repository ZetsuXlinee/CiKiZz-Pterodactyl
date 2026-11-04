import { Application, Setup } from 'pterodactyl-api-wrapper';
import { randomBytes } from 'crypto';
import { Plan } from './plans';

Setup.setPanel(process.env.PTERO_PANEL_URL!);
const pteroApp = new Application(process.env.PTERO_APP_API_KEY!);

export async function provisionAccount(params: {
  email: string;
  name: string;
  plan: Plan;
}) {
  const username = params.email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 20).toLowerCase();
  const password = randomBytes(8).toString('hex');

  const user = await pteroApp.createUser({
    email: params.email,
    username,
    first_name: params.name.split(' ')[0] || 'Member',
    last_name: params.name.split(' ').slice(1).join(' ') || 'CiKiZz',
    password,
  });

  const server = await pteroApp.createServer({
    name: `bot-${username}`,
    user: user.id,
    nest: Number(process.env.PTERO_NEST_ID || 1),
    egg: Number(process.env.PTERO_EGG_ID || 1),
    docker_image: process.env.PTERO_DOCKER_IMAGE || 'ghcr.io/parkervcp/yolks:nodejs_18',
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

  return { user, server, password, username };
}