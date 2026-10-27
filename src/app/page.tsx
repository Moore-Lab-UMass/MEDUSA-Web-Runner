import { redirect } from 'next/navigation';

// The home page (HomePage in src/common/components/home) is disabled for now, so the site lands
// on the simulator's upload step. To restore it, render <HomePage /> here with its metadata:
//   title: 'MEDUSA'
//   description: 'CRISPR screens reveal which genes affect drug response. MEDUSA reveals why: growth, death, or both.'
export default function Home() {
  redirect('/simulator');
}
