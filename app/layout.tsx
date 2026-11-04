import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata = { title: 'CiKiZz Petrodactyl', description: 'Akun member Pterodactyl untuk bot WhatsApp/Telegram/Discord' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}