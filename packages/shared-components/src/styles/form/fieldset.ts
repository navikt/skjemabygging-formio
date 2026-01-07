const fieldset = {
  '& .aksel-fieldset': {
    '&__legend-formio-template': {
      fontSize: '1.25rem',
      lineHeight: '1.625rem',
      marginBottom: 'var(--ax-space-8)',
    },
    '&__content': {
      padding: 'var(--ax-space-16) var(--ax-space-16) 0 var(--ax-space-16)',
      marginBottom: 0,
      overflow: 'auto',
      '&--background-color': {
        borderRadius: '0.25rem',
        backgroundColor: 'var(--ax-brand-blue-100)',
      },
    },
  },
  '& .formio-component-navSkjemagruppe > fieldset >.aksel-fieldset__content--background-color': {
    backgroundColor: 'var(--ax-brand-blue-200)',
  },
};

export default fieldset;
