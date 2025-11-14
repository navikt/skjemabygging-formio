const plugin = {
  rules: {
    'no-cypress-only': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow committed Cypress tests with .only',
        },
        messages: {
          noOnly: 'Unexpected use of {{name}}.only in Cypress tests.',
        },
      },
      create(context) {
        if (!context.getFilename().includes('cypress/e2e')) {
          return {};
        }
        return {
          MemberExpression(node) {
            const { object, property } = node;
            if (
              property?.type === 'Identifier' &&
              property.name === 'only' &&
              object?.type === 'Identifier' &&
              (object.name === 'describe' || object.name === 'it')
            ) {
              context.report({
                node,
                messageId: 'noOnly',
                data: { name: object.name },
              });
            }
          },
        };
      },
    },
  },
};

export default plugin;
