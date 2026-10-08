import type { Metadata } from 'next';
import RunPage from '@/common/components/RunPage';

export const metadata: Metadata = {
  title: 'MEDUSA Run',
  description: 'Monitor a MEDUSA run and view its results.',
};

export default async function Page({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  // Keyed so that navigating between runs starts from empty state rather than the last run's.
  return <RunPage key={runId} runId={runId} />;
}
