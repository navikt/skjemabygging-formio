const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Form Spec API',
    version: '1.0.0',
    description:
      'API for retrieving JSON Schema documents for forms. Authenticate via Entra ID login — the NAIS sidecar handles the session and provides the bearer token automatically.',
  },
  tags: [
    {
      name: 'forms',
      description: 'Operations for form schema retrieval',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Employee bearer token provided by the NAIS login sidecar after Entra ID authentication.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          errorCode: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
        additionalProperties: true,
      },
      FormSubmissionSpec: {
        type: 'object',
        description: 'Generated JSON Schema for the requested form submission.',
        additionalProperties: true,
      },
    },
  },
  paths: {
    '/api/employee/forms/{formPath}/spec': {
      get: {
        tags: ['forms'],
        operationId: 'getEmployeeFormSpec',
        summary: 'Get form submission schema (employee)',
        description:
          'Returns the generated JSON Schema for the requested form path. Requires employee authentication via Entra ID.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'formPath',
            in: 'path',
            required: true,
            description: 'Form path identifier, for example nav123456.',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'JSON Schema for the requested form.',
            content: {
              'application/schema+json': {
                schema: {
                  $ref: '#/components/schemas/FormSubmissionSpec',
                },
              },
            },
          },
          401: {
            description: 'Missing or invalid bearer token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          404: {
            description: 'Form was not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          500: {
            description: 'Unexpected server error.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export default openApiDocument;
