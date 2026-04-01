const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Form Spec API',
    version: '1.0.0',
    description: 'API for retrieving JSON Schema documents for forms.',
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
        description: 'Provide the bearer token used to access the /api endpoints.',
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
    '/api/forms/{formPath}/spec': {
      get: {
        tags: ['forms'],
        operationId: 'getFormSpec',
        summary: 'Get form submission schema',
        description: 'Returns the generated JSON Schema for the requested form path.',
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
