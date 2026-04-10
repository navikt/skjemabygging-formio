import request from 'supertest';
import { createApp } from './app';

describe('createApp', () => {
  it('returns the OpenAPI document', async () => {
    const response = await request(createApp()).get('/openapi.json').expect(200);

    expect(response.body.components.securitySchemes.bearerAuth).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Employee bearer token provided by the NAIS login sidecar after Entra ID authentication.',
    });
    expect(response.body.paths['/api/employee/forms/{formPath}/spec'].get.security).toEqual([{ bearerAuth: [] }]);
    expect(response.body.paths['/api/forms/{formPath}/spec']).toBeUndefined();
  });

  it('serves the Swagger UI page', async () => {
    const response = await request(createApp()).get('/swagger-ui/').expect(200);

    expect(response.header['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('Swagger UI');
  });
});
