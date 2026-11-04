export type Plan = {
  id: string;
  name: string;
  price: number;
  days: number;
  memory: number;   // MB
  disk: number;     // MB
  cpu: number;      // %
  desc: string;
};

export const PLANS: Record<string, Plan> = {
  basic: { id: 'basic', name: 'Basic', price: 2500, days: 30,  memory: 1024, disk: 5120,  cpu: 100, desc: '1GB RAM · 5GB Disk' },
  pro:   { id: 'pro',   name: 'Pro',   price: 6500, days: 90,  memory: 2048, disk: 10240, cpu: 200, desc: '2GB RAM · 10GB Disk' },
  elite: { id: 'elite', name: 'Elite', price: 12000, days: 180, memory: 4096, disk: 20480, cpu: 400, desc: '4GB RAM · 20GB Disk' },
};