import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;

describe('HTTP Endpoint tests for clear/v1', () => {
  test('Test for clear/v1 return type', () => {
    const res = request(
      'DELETE',
            `${url}:${port}/clear/v1`
    );
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toEqual({});
  });
});
