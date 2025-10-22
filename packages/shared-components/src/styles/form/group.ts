const group = {
  '& .form-group:not(.formio-hidden)': {
    clear: 'both',
    marginBottom: 'var(--a-spacing-10)',

    '&:last-child.formio-component-navSkjemagruppe, &:last-child.formio-component-datagrid': {
      marginBottom: 0,
    },
  },
  '& .group-margin-small .form-group:not(.formio-hidden)': {
    clear: 'both',
    marginBottom: 'var(--a-spacing-3)',
  },
};

export default group;
