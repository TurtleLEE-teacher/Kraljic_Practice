import ScenarioClient from './ScenarioClient';

export function generateStaticParams() {
  const quadrants = ['bottleneck', 'leverage', 'strategic', 'noncritical'];
  const steps = ['1', '2', '3', '4'];
  return quadrants.flatMap((quadrant) =>
    steps.map((step) => ({ quadrant, step }))
  );
}

export default function ScenarioPage() {
  return <ScenarioClient />;
}
