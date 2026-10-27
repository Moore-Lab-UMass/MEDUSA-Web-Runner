import Hero from './Hero';
import WhatIsMedusa from './WhatIsMedusa';
import HowItWorks from './HowItWorks';
import ExampleDatasets from './ExampleDatasets';
import RunLocally from './RunLocally';
import CreateAccount from './CreateAccount';

// The landing page. Not routed for now: / redirects to /simulator (see src/app/page.tsx).
export default function HomePage() {
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
