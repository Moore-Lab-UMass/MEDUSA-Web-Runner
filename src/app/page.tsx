import type { Metadata } from 'next';
import Hero from '@/common/components/home/Hero';
import WhatIsMedusa from '@/common/components/home/WhatIsMedusa';
import HowItWorks from '@/common/components/home/HowItWorks';
import ExampleDatasets from '@/common/components/home/ExampleDatasets';
import RunLocally from '@/common/components/home/RunLocally';
import CreateAccount from '@/common/components/home/CreateAccount';

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
