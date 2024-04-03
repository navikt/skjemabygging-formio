export interface ComponentError {
  elementId?: string;
  message: string;
  path: string;
  level: 'error';
}
