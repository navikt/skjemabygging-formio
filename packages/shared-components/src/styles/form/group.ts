const group = {
  '& .form-group:not(.formio-hidden)': {
    clear: 'both',
    marginBottom: 'var(--ax-space-40)',

    '&:last-child.formio-component-navSkjemagruppe, &:last-child.formio-component-datagrid': {
      marginBottom: 'var(--ax-space-24)',
    },
  },
  '& .group-margin-small .form-group:not(.formio-hidden)': {
    clear: 'both',
    marginBottom: 'var(--ax-space-12)',
  },
};

export default group;
