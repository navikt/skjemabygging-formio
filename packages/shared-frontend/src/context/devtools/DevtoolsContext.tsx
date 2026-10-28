import { createContext, ReactNode, useContext, useMemo } from 'react';
import { createDevtoolsReport, DevtoolsConnection, DevtoolsReport } from './devtoolsSession';

interface Props {
  connection?: DevtoolsConnection;
  children: ReactNode;
}

const DevtoolsContext = createContext<DevtoolsReport | undefined>(undefined);

const DevtoolsProvider = ({ connection, children }: Props) => {
  const report = useMemo(() => (connection ? createDevtoolsReport(connection) : undefined), [connection]);
  return <DevtoolsContext.Provider value={report}>{children}</DevtoolsContext.Provider>;
};

// Undefined without a connection. Call it with `?.` so the reported value is not computed then.
const useDevtoolsReport = (): DevtoolsReport | undefined => useContext(DevtoolsContext);

export { DevtoolsProvider, useDevtoolsReport };
