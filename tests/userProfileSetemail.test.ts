import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

interface authRegisterObj {
  token: string,
  authUserId: number
}

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});
afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid return', () => {
  test('return empty object', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });

    res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: 'original@email.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'different@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'updated@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });

  test('Change email to user\'s current email', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: 'original@email.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'original@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Email error returns', () => {
  test('Invalid email', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token: string = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'updated#@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Email is used for another user', () => {
    // ======================== SET UP START ===========================
    const userData: authRegisterObj[] = [];
    const userInput = [
      { email: 'original@email.com', password: '1234567', nameFirst: 'original', nameLast: 'Last' },
      { email: 'copy@email.com', password: '1234567', nameFirst: 'user', nameLast: 'Last' },
    ];

    for (const users of userInput) {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
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
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'copy@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[0].token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid email type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 0
      },
      headers: {
        'Content-type': 'application/json',
        token: token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});

describe('Token error returns', () => {
  test('Nonexistant token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA';

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'updated@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid token type', () => {
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });

    const badToken: any = { token: 1 };
    const res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'updated@email.com'
      },
      headers: {
        'Content-type': 'application/json',
        token: badToken.token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
