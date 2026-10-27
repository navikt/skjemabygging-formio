import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createDevtoolsReport, DevtoolsConnection, DevtoolsReport } from './devtoolsSession';

interface Props {
  connection?: DevtoolsConnection;
  children: ReactNode;
}

const DevtoolsContext = createContext<DevtoolsReport | undefined>(undefined);

const noReport: DevtoolsReport = () => undefined;

const DevtoolsProvider = ({ connection, children }: Props) => {
  const report = useMemo(() => (connection ? createDevtoolsReport(connection) : undefined), [connection]);
  return <DevtoolsContext.Provider value={report}>{children}</DevtoolsContext.Provider>;
};

const useDevtoolsEnabled = (): boolean => useContext(DevtoolsContext) !== undefined;

// Stable no-op without a connection, so providers can report unconditionally.
const useDevtoolsReport = (): DevtoolsReport => useContext(DevtoolsContext) ?? noReport;

export { DevtoolsProvider, useDevtoolsEnabled, useDevtoolsReport };
