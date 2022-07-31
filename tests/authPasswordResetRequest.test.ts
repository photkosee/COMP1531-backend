import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registeredData: any = {};

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  const res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mriduls907@gmail.com',
      password: 'mriduls907',
      nameFirst: 'Mridul',
      nameLast: 'Singh'
    }
  });
  registeredData = JSON.parse(res.body as string);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Test with invalid email - auth/passwordreset/request/v1', () => {
  const res = request('POST', `${url}:${port}/auth/passwordreset/request/v1`, {
    body: JSON.stringify({
      email: 'email@mail.com'
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(bodyObj).toStrictEqual({});
});

test('Successful password Reset Request - auth/passwordreset/request/v1', () => {
  const res = request('POST', `${url}:${port}/auth/passwordreset/request/v1`, {
    body: JSON.stringify({
      email: 'mriduls907@gmail.com'
    }),
    headers: {
      'Content-type': 'application/json'
    }
  });
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(OK);
  expect(bodyObj).toStrictEqual({});
});

test('Logged out of all current sessions after password reset request - auth/passwordreset/request/v1', () => {
  const res = request(
    'GET', `${url}:${port}/dm/list/v2`,
    {
      headers: {
        'Content-type': 'application/json',
        token: registeredData.token
      }
    }
  );
  expect(res.statusCode).toBe(FORBIDDEN);
});
