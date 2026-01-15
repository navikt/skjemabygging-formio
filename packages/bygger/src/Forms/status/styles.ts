import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { StreetLightSize } from './types';

const useStatusStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  statusRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDiffButton: {
    marginTop: '0.5rem',
    minWidth: '1rem',
  },
  resetFormButton: {
    marginTop: '0.5rem',
    minWidth: '1rem',
  },
  rowText: {
    flex: '1',
    margin: '0',
  },
  panelItem: ({ spacing }: { spacing?: string }) => ({
    '&:not(:last-child)': {
      marginBottom: spacing && spacing === 'small' ? '1rem' : '2.5rem',
    },
  }),
  sidePanelFormStatusContainer: {
    marginTop: '0.5rem',
  },
});

const useFormStatusIndicatorStyles = makeStyles({
  streetLight: (props: { size: StreetLightSize }) => ({
    width: props.size === 'small' ? '1rem' : '1.5rem',
    maxWidth: props.size === 'small' ? '1rem' : '1.5rem',
    height: props.size === 'small' ? '1rem' : '1.5rem',
    borderRadius: '50%',
    marginRight: '0.75rem',
    flex: '1',
  }),
  published: {
    backgroundColor: '#219653',
  },
  pending: {
    backgroundColor: 'rgb(255, 145, 0)',
  },
  draft: {
    backgroundColor: '#2D9CDB',
  },
  unpublished: {
    backgroundColor: '#AA5EEB',
  },
  testform: {
    backgroundColor: '#EB5757',
  },
});

export { useFormStatusIndicatorStyles, useStatusStyles };
