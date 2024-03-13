export interface ComponentError {
  metadataId: string;
  message: string;
  path: string;
  level: 'error';

  messages: { formattedKeyOrPath: string; message: string; context: { hasLabel: boolean } }[];
  component: { key: string };
}
