import request from 'sync-request';
import config from '../src/config.json';

const BADREQUEST = 400;
const port = config.port;
const url = config.url;

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'f09acrunchie@gmail.com',
      password: 'mriduls907',
      nameFirst: 'Mridul',
      nameLast: 'Singh'
    }
  });
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Test with invalid password/resetCode - auth/passwordreset/reset/v1', () => {
  request('POST', `${url}:${port}/auth/passwordreset/request/v1`, {
    body: JSON.stringify({
      email: 'f09acrunchie@gmail.com'
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });

  let res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
    body: JSON.stringify({
      resetCode: '876545',
      newPassword: '123',
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);

  res = request('POST', `${url}:${port}/auth/passwordreset/reset/v1`, {
    body: JSON.stringify({
      resetCode: '876545',
      newPassword: '123456',
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);
});
