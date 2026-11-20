import { describe, expect, it } from 'vitest';

describe('Lambda handler', () => {
  it('serves the Express app for an API Gateway HTTP API event', async () => {
    process.env.NODE_ENV = 'test';
    const { handler } = await import('../src/lambda.js');
    const event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/api/health',
      rawQueryString: '',
      headers: { host: 'example.execute-api.us-east-1.amazonaws.com' },
      requestContext: {
        http: { method: 'GET', path: '/api/health', sourceIp: '203.0.113.10' },
        stage: '$default',
      },
      isBase64Encoded: false,
    };
    const res = await handler(event, {});
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ status: 'ok' });
  });
});
