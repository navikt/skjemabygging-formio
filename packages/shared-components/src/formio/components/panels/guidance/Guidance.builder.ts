const guidanceBuilder = () => {
  return {
    title: 'Veiledning',
    schema: {
      title: 'Veiledning',
      type: 'panel',
      input: false,
      key: 'veiledning',
      theme: 'default',
      components: [
        {
          label: 'Veiledningstekst',
          type: 'htmlelement',
          key: 'veiledningstekst',
          input: false,
          content: 'Her skal det stå en veiledningstekst for søknaden',
        },
      ],
    },
  };
};

export default guidanceBuilder;
