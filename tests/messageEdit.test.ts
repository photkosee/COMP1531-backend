import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing success editing and removing message - message/edit/v2', () => {
  test('valid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'zzz'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({});

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({});
  });
});

describe('Testing for error - message/edit/v2', () => {
  test('Invalid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 2,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
