import buttonRow from './buttonRow';
import ckEditor from './ckEditor';
import errorSummary from './errorSummary';
import labelTrackChanges from './labelTrackChanges';
import margin from './margin';
import preview from './preview';
import rowLayout from './rowLayout';
import sidebarLayout from './sidebarLayout';
import stepper from './stepper';
import vars from './vars';

const global = {
  html: {
    height: '100%',
    fontFamily: 'Source Sans Pro, Arial, sans-serif',
  },
  body: {
    margin: 0,
    backgroundColor: '#ffffff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.5',
    fontSize: '1.125rem',
    fontWeight: 400,
    fontFamily: 'Source Sans Pro, Arial, sans-serif',
    textAlign: 'left',
    color: '#262626',
  },
  a: {
    color: 'var(--ac-link-action-text,var(--a-text-action))',
    gap: 'var(--a-spacing-1)',
  },
  h3: {
    fontSize: 'var(--a-font-size-heading-small)',
    lineHeight: 'var(--a-font-line-height-heading-small)',
    marginBottom: 'var(--a-spacing-3)',
  },
  h4: {
    fontSize: 'var(--a-font-size-heading-xsmall)',
    lineHeight: 'var(--a-font-line-height-heading-xsmall)',
  },
  fieldset: {
    border: 0,
    padding: 0,
  },
  '.pagewrapper': {
    flex: '1 0 auto',
  },
  '#decorator-footer': {
    flexShrink: 0,
  },
  'main:focus': {
    outline: 'none',
  },
  // Override Aksel css for page, since it causes problems with our sticky elements.
  '#root .navds-page__content--padding': {
    paddingBlockEnd: 0,
  },
  ...labelTrackChanges,
  ...errorSummary,
  ...buttonRow,
  ...margin,
  ...preview,
  ...stepper,
  ...vars,
  ...ckEditor,
  ...rowLayout,
  ...sidebarLayout,
};

export default global;
