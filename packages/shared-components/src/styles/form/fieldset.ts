const fieldset = {
  '& .navds-fieldset': {
    '&__legend-formio-template': {
      fontSize: '1.25rem',
      lineHeight: '1.625rem',
      marginBottom: 'var(--a-spacing-2)',
    },
    '&__content': {
      padding: 'var(--a-spacing-4) 0 var(--a-spacing-10) 0',
      marginBottom: 0,
      '&--background-color': {
        padding: 'var(--a-spacing-4) var(--a-spacing-4) var(--a-spacing-6) var(--a-spacing-4)',
        borderRadius: '0.25rem',
        backgroundColor: 'var(--a-deepblue-50)',
      },
    },
  },
  '& .formio-component-navSkjemagruppe .navds-fieldset__content--background-color': {
    backgroundColor: 'var(--a-deepblue-100)',
  },
};

export default fieldset;
