import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Promptly — Your agentic workforce', template: '%s · Promptly' },
  description:
    'One request. A team of specialist AI agents. Thoughtful work, brought together in one place.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
