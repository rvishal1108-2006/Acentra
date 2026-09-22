import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useRealTimeEngine() {
  const isSimulationActive = useStore((s) => s.isSimulationActive);
  const simulationSpeed = useStore((s) => s.simulationSpeed);
  const tickSimulation = useStore((s) => s.tickSimulation);

  useEffect(() => {
    if (!isSimulationActive) return;

    // Normal tick is every 1500ms / speed
    const intervalMs = Math.max(300, Math.floor(1500 / simulationSpeed));
    const interval = setInterval(() => {
      tickSimulation();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimulationActive, simulationSpeed, tickSimulation]);
}
