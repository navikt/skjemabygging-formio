const log = {
  '@timestamp': '2022-01-13T13:58:37.067Z',
  'log.level': 'info',
  message:
    '::ffff:127.0.0.1 - - [13/Jan/2022:13:58:37 +0000] "POST /fyllut/api/foersteside HTTP/1.1" 200 149456 "http://localhost:3001/fyllut/wip888888/send-i-posten" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"',
  ecs: { version: '1.6.0' },
  http: {
    version: '1.1',
    request: {
      method: 'POST',
      headers: {
        'x-forwarded-host': 'localhost:3001',
        'x-forwarded-proto': 'http',
        'x-forwarded-port': '3001',
        'x-forwarded-for': '127.0.0.1',
        cookie:
          '_ga=GA1.1.1750164544.1620213495; _hjid=f01e9e3a-a2c0-47f6-9d2e-02e4ed2da847; _hjSessionUser_118350=eyJpZCI6IjExZjlhNDBjLWMyOWEtNWVjZC1hZDQ4LTJhZjZlMGRjMjAyMSIsImNyZWF0ZWQiOjE2MzkwMzU2ODM4NDMsImV4aXN0aW5nIjp0cnVlfQ==; _hjMinimizedPolls=490125; vngage.lkvt=7531DC2A-2078-4870-80F8-F44DCE0F45C3; amp_defaul=_cH9BnVvQ58AC8rj3Xo6Sb...1fp9hreh2.1fp9rcjjn.2na.1b.2ol',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        referer: 'http://localhost:3001/fyllut/wip888888/send-i-posten',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        origin: 'http://localhost:8081',
        accept: '*/*',
        'content-type': 'application/json',
        'sec-ch-ua-platform': '"Linux"',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua': '"Chromium";v="97", " Not;A Brand";v="99"',
        'content-length': '528',
        connection: 'close',
        host: 'localhost:8081',
        Authorization: 'Bearer 123456789',
        AzureAccessToken: 'Complete-azure-access-token',
        PdfAccessToken: 'Token-for-pdf-service',
        MergePdfToken: 'Token-for-pdf-merge-service',
        'x-client-ip': '127.0.0.101',
      },
      body: { bytes: 528 },
    },
    response: {
      status_code: 200,
      headers: {
        'x-powered-by': 'Express',
        'access-control-allow-origin': '*',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '149456',
        etag: 'W/"247d0-Ryc508NFn0qs3LsmIjxHB3CBWtk"',
      },
      body: { bytes: 149456 },
    },
  },
  url: { path: '/api/foersteside', domain: 'localhost', full: 'http://localhost:8081/api/foersteside' },
  client: { address: '::ffff:127.0.0.1', ip: '::ffff:127.0.0.1', port: 46390 },
  user_agent: {
    original:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
  },
  correlation_id: '906d2273-8292-4665-9895-5cf6220dc6a6',
};

export default log;
