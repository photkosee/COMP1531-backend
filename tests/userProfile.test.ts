import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Return user', () => {
  test('Valid user and autherised user', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const authUser = JSON.parse(res.getBody() as string);
    const userId = authUser.authUserId;

    res = request(
      'GET', `${url}:${port}/user/profile/v2`, {
        qs: {
          token: token,
          uId: userId
        }
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      user: {
        uId: userId,
        email: 'user@gmail.com',
        nameFirst: 'User',
        nameLast: 'Last',
        handleStr: expect.any(String),
      }
    });
  });
});

describe('Return error', () => {
  test('Non-existent Id and Invalid Id', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.tokenl;

    res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const authUser = JSON.parse(res.getBody() as string);
    const userId = authUser.authUserId;

    const dummyToken = token + '1';
    const dummyUserId = userId + 1;

    const passData: any = [
      { token: dummyToken, uId: userId },
      { token: token, uId: dummyUserId },
      { token: token, uId: '0' },
      { token: '0', uId: userId },
      { token: token, uId: '' },
      { token: '', uId: userId },
    ];

    for (const test of passData) {
      const res = request(
        'GET', `${url}:${port}/user/profile/v2`, {
          qs: {
            token: test.token,
            uId: test.uId
          }
        }
      );
      const data = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual(ERROR);
    }
  });
});
