// Nais Texas sidecar. Sendinn-backend only calls introspection when the request has a bearer token,
// so tests choose the session state by sending a token and selecting a variant.
// The token route issues machine-to-machine tokens, for example for the cover-page generator.
const introspection = (claims: Record<string, unknown>) => ({
  status: 200,
  body: claims,
});

export default [
  {
    id: 'post-texas-introspect',
    url: '/texas/introspect',
    method: 'POST',
    variants: [
      {
        id: 'signed-in',
        type: 'json',
        options: introspection({ active: true, acr: 'idporten-loa-high', pid: '12345678911' }),
      },
      {
        id: 'signed-out',
        type: 'json',
        options: introspection({ active: false, error: 'token is expired' }),
      },
      {
        id: 'wrong-level',
        type: 'json',
        options: introspection({ active: true, acr: 'idporten-loa-substantial', pid: '12345678911' }),
      },
    ],
  },
  {
    id: 'post-texas-token',
    url: '/texas/token',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: { status: 200, body: { access_token: 'mock-texas-token', expires_in: 3600, token_type: 'Bearer' } },
      },
    ],
  },
];
