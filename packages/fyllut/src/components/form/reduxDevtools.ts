import { DevtoolsConnection } from '@navikt/skjemadigitalisering-shared-frontend';

interface ReduxDevtoolsExtension {
  connect: (options: { name: string; maxAge?: number }) => DevtoolsConnection;
}

type WindowWithReduxDevtools = Window & { __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtension };

// Reused per name, so StrictMode double renders and remounts do not add duplicate instances.
const connections = new Map<string, DevtoolsConnection>();

/**
 * Connects to the Redux DevTools browser extension, if installed. Never call this in production:
 * the inspected state contains the user's answers.
 */
const connectReduxDevtools = (name: string): DevtoolsConnection | undefined => {
  const existing = connections.get(name);
  if (existing) {
    return existing;
  }

  const connection = (window as WindowWithReduxDevtools).__REDUX_DEVTOOLS_EXTENSION__?.connect({ name, maxAge: 200 });
  if (connection) {
    connections.set(name, connection);
  }
  return connection;
};

export { connectReduxDevtools };
