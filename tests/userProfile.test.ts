import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

import { authRegisterV1 } from '../src/auth.ts';
import { userProfileV1 } from '../src/users.ts';
import { clearV1 } from '../src/other.ts';

beforeEach(() => {
  clearV1();
});

describe('Return user', () => {
  test('Valid user and autherised user', () => {
    let user = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
    let token = user.token;

    user = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
    let userId = user.authUserId;

    const res = request(
      'GET', `${url}:${port}/user/profile`, {
        qs: {
          token: token,
          uId: userId
        }
      }
    );
    const data = JSON.parse(res.body() as string);
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
    let user = authRegisterV1('auth@gmail.com', 'password', 'Auth', 'Last');
    let token = user.token;

    user = authRegisterV1('user@gmail.com', 'password', 'User', 'Last');
    let userId = user.authUserId;

    const dummyToken = token + '1';
    const dummyUserId = userId + 1;

    const invalidPassData = [
      { token: dummyToken, uId: userId },
      { token: token, uId: dummyUserId },
      { token: token, uId: '0' },
      { token: '0', uId: userId },
      { token: token, uId: ''},
      { token: '', uId: userId  },
    ]
  });
});