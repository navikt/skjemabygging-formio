export interface ComponentError {
  elementId?: string;
  message: string;
  path: string;
  level: 'error';

  messages?: { formattedKeyOrPath: string; message: string; context: { hasLabel: boolean } }[];
  component?: { key: string };
}
