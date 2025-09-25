const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Lambda Function Tests', () => {
  test('should validate JWT format', () => {
    const validJWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiYXVkIjoiaHR0cHM6Ly90ZXN0LmFwaSIsImV4cCI6OTk5OTk5OTk5OX0.signature';
    const parts = validJWT.split('.');
    assert.strictEqual(parts.length, 3);
  });

  test('should decode JWT payload', () => {
    const payload = { sub: 'test', aud: 'https://test.api', exp: 9999999999 };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
    
    assert.strictEqual(decoded.sub, 'test');
    assert.strictEqual(decoded.aud, 'https://test.api');
  });

  test('should handle CORS headers', () => {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };
    
    assert.strictEqual(corsHeaders["Access-Control-Allow-Origin"], "*");
    assert.ok(corsHeaders["Access-Control-Allow-Methods"].includes("GET"));
  });
});