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

describe('Return user', () => {
  test('Valid user and autherised user', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
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
      'GET', `${url}:${port}/user/profile/v3`, {
        qs: {
          uId: userId
        },
        headers: {
          'Content-type': 'application/json',
          token: token
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
  test('Non-existent and Invalid Token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const authUser = JSON.parse(res.getBody() as string);
    const userId = authUser.authUserId;

    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA';

    const passData: any = [
      { token: dummyToken, uId: userId },
      { token: '0', uId: userId },
      { token: '', uId: userId },
    ];

    for (const test of passData) {
      const res = request(
        'GET', `${url}:${port}/user/profile/v3`, {
          qs: {
            uId: test.uId
          },
          headers: {
            'Content-type': 'application/json',
            token: test.token,
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Non-existent and Invalid uId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const authUser = JSON.parse(res.getBody() as string);
    const userId = authUser.authUserId;

    const dummyUserId = userId + 1;

    const passData: any = [
      { token: token, uId: dummyUserId },
      { token: token, uId: '0' },
      { token: token, uId: '' },
    ];

    for (const test of passData) {
      const res = request(
        'GET', `${url}:${port}/user/profile/v3`, {
          qs: {
            uId: test.uId
          },
          headers: {
            'Content-type': 'application/json',
            token: test.token,
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });
});
