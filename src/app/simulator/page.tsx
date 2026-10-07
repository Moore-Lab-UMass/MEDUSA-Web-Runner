import type { Metadata } from 'next';
import MedusaApp from '@/common/components/MedusaApp';

export const metadata: Metadata = {
  title: 'MEDUSA Web Runner',
  description: 'Run and manage MEDUSA workflows from the browser.',
};

export default function SimulatorPage() {
  return <MedusaApp />;
}
