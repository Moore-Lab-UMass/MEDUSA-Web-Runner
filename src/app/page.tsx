import type { Metadata } from 'next';
import MedusaApp from '@/components/MedusaApp';

export const metadata: Metadata = {
  title: 'MEDUSA Web Runner',
  description: 'Run and manage MEDUSA workflows from the browser.',
};

export default function Home() {
  return <MedusaApp />;
}
