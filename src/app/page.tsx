import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import WhatIsMedusa from '@/components/home/WhatIsMedusa';
import HowItWorks from '@/components/home/HowItWorks';
import ExampleDatasets from '@/components/home/ExampleDatasets';
import RunLocally from '@/components/home/RunLocally';
import CreateAccount from '@/components/home/CreateAccount';

export const metadata: Metadata = {
  title: 'MEDUSA',
  description: 'CRISPR screens reveal which genes affect drug response. MEDUSA reveals why: growth, death, or both.',
};

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatIsMedusa />
      <HowItWorks />
      <ExampleDatasets />
      <RunLocally />
      <CreateAccount />
    </main>
  );
}
