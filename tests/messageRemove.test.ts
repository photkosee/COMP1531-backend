import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing success removing message - message/remove/v1', () => {
  test('valid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: true
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channel).toStrictEqual({ channelId: 1 });

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: token,
        channelId: 1,
        message: 'abc'
      }
    });
    const message = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message).toStrictEqual({ messageId: 1 });

    res = request('DELETE', `${url}:${port}/message/remove/v1`, {
      qs: {
        token: token,
        messageId: 1,
      }
    });
    const remove = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(remove).toStrictEqual({});
  });
});

describe('Testing for error - message/remove/v1', () => {
  test('Invalid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'One2',
        nameLast: 'Number2',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: true
      }
    });
    const channel = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channel).toStrictEqual({ channelId: 1 });

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: token,
        channelId: 1,
        message: 'abc'
      }
    });
    const message = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message).toStrictEqual({ messageId: 1 });

    res = request('DELETE', `${url}:${port}/message/remove/v1`, {
      qs: {
        token: -55,
        messageId: 1,
      }
    });
    const remove = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(remove).toStrictEqual(ERROR);

    res = request('DELETE', `${url}:${port}/message/remove/v1`, {
      qs: {
        token: token,
        messageId: 2,
      }
    });
    const remove2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(remove2).toStrictEqual(ERROR);

    res = request('DELETE', `${url}:${port}/message/remove/v1`, {
      qs: {
        token: token2,
        messageId: 1,
      }
    });
    const remove3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(remove3).toStrictEqual(ERROR);
  });
});
