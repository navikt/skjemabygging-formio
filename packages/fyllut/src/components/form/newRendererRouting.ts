interface Props {
  formPath?: string;
  routePath?: string;
  newRenderForms: string[];
}

const shouldUseNewRenderer = ({ formPath, routePath, newRenderForms }: Props) =>
  !!formPath &&
  (newRenderForms.includes('*') || newRenderForms.includes(formPath)) &&
  routePath?.replace(/\/+$/, '') !== 'pdf';

export { shouldUseNewRenderer };
