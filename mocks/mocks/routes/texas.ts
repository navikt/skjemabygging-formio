// Nais Texas sidecar. Sendinn-backend only calls introspection when the request has a bearer token,
// so tests choose the session state by sending a token and selecting a variant.
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
    id: 'post-texas-exchange',
    url: '/texas/exchange',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'json',
        options: {
          status: 200,
          body: { access_token: 'tokenx-access-token', expires_in: 3600, token_type: 'Bearer' },
        },
      },
      {
        id: 'error',
        type: 'json',
        options: {
          status: 400,
          body: { error: 'invalid_request', error_description: 'invalid target' },
        },
      },
    ],
  },
];
