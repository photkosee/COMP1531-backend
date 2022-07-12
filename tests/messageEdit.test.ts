import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing success editing and removing message - message/edit/v1', () => {
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

    res = request('PUT', `${url}:${port}/message/edit/v1`, {
      json: {
        token: token,
        messageId: 1, 
        message: 'zzz'
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({});

    res = request('PUT', `${url}:${port}/message/edit/v1`, {
      json: {
        token: token,
        messageId: 1, 
        message: ''
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({});
  });

  describe('Testing for error - message/edit/v1', () => {
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
          email: 'mal1@email.com',
          password: '1234567',
          nameFirst: 'One',
          nameLast: 'Number',
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
  
      res = request('PUT', `${url}:${port}/message/edit/v1`, {
        json: {
          token: token,
          messageId: 2, 
          message: 'zzz'
        }
      });
      const message2 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message2).toStrictEqual(ERROR);

      res = request('PUT', `${url}:${port}/message/edit/v1`, {
        json: {
          token: token2,
          messageId: 1, 
          message: 'zzz'
        }
      });
      const message3 = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(message3).toStrictEqual(ERROR);
    });
  });
});
