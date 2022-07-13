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

describe('Testing success sendind message - message/send/v1', () => {
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
  });
<<<<<<< HEAD
});

describe('Testing for error - message/send/v1', () => {
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
        message: ''
      }
    });
    const message = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message).toStrictEqual(ERROR);

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: -5,
        channelId: 1, 
        message: 'abc'
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual(ERROR);

    res = request('POST', `${url}:${port}/message/send/v1`, {
      json: {
        token: token,
        channelId: 2, 
        message: 'abc'
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual(ERROR);
=======

  describe('Testing for error - message/send/v1', () => {
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
          message: ''
        }
      });
      const message = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message).toStrictEqual(ERROR);

      res = request('POST', `${url}:${port}/message/send/v1`, {
        json: {
          token: -5,
          channelId: 1, 
          message: 'abc'
        }
      });
      const message2 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message2).toStrictEqual(ERROR);

      res = request('POST', `${url}:${port}/message/send/v1`, {
        json: {
          token: token,
          channelId: 2, 
          message: 'abc'
        }
      });
      const message3 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message3).toStrictEqual(ERROR);
    });
>>>>>>> 28e893bdf424a0edb0290e2345c6ba7838aedf21
  });
});
