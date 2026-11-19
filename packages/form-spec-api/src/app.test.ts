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
    expect(response.text).toContain('swagger-ui-init.js');
    expect(response.text).not.toContain('swagger-initializer.js');
  });

  it('redirects the bundled index page to the configured Swagger UI', async () => {
    await request(createApp()).get('/swagger-ui/index.html').expect(302).expect('Location', '/swagger-ui/');
  });

  it('initializes Swagger UI with the Form Spec API document instead of Petstore', async () => {
    const response = await request(createApp()).get('/swagger-ui/swagger-ui-init.js').expect(200);

    expect(response.text).toContain('Form Spec API');
    expect(response.text).toContain('/api/employee/forms/{formPath}/spec');
    expect(response.text).not.toContain('petstore.swagger.io');
  });
});
