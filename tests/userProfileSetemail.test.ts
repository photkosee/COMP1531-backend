import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

interface authRegisterObj {
  token: string,
  authUserId: number
}

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid return', () => {
  test('return empty object', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: token,
        email: 'updated@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });

  test('Change email to user\'s current email', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: token,
        email: 'original@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Email error returns', () => {
  test('Invalid email', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: token,
        email: 'updated#@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Email is used for another user', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'original@email.com', password: '1234567', nameFirst: 'original', nameLast: 'Last' },
      { email: 'copy@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
    ];

    for (const users of userInput) {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: users.email,
          password: users.password,
          nameFirst: users.nameFirst,
          nameLast: users.nameLast
        }
      });
      const user: authRegisterObj = JSON.parse(res.getBody() as string);
      expect(res.statusCode).toBe(OK);
      userData.push({ token: user.token, authUserId: user.authUserId });
    }
    // ======================== SET UP START ===========================
    let res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: userData[0].token,
        email: 'copy@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invalid email type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: token,
        email: 0
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});

describe('Token error returns', () => {
  test('Nonexistant token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;
    const dummyToken = token + 'abc';

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: dummyToken,
        email: 'updated@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invalid token type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v1`, {
      json: {
        token: 1,
        email: 'updated@email.com'
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});

