import request from 'sync-request';
import config from '../src/config.json';

const BADREQUEST = 400;
const FORBIDDEN = 403;
const OK = 200;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with wrong typeof parameter - channels/create/v3', () => {
  test('Invalid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: ''
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: 123
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  describe('Testing for name length - channels/create/v3', () => {
    test('Invalid inputs', () => {
      let res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: 'mal1@email.com',
          password: '1234567',
          nameFirst: 'One',
          nameLast: 'Number',
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      const user = JSON.parse(res.getBody() as string);
      const token = user.token;

      res = request('POST', `${url}:${port}/channels/create/v3`, {
        body: JSON.stringify({
          name: '',
          isPublic: false
        }),
        headers: {
          'Content-type': 'application/json',
          token: token
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);

      res = request('POST', `${url}:${port}/channels/create/v3`, {
        body: JSON.stringify({
          name: '1234567891011121314151617',
          isPublic: false
        }),
        headers: {
          'Content-type': 'application/json',
          token: token
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);
    });
  });
});

describe('Succesfully creating channels - channels/create/v3', () => {
  test('Valid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channel).toStrictEqual({ channelId: 1 });
  });
});
