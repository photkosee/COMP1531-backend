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
  test('Valid change of handle', () => {
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
        email: 'original@gmail.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'different@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });

    res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: 'original@gmail.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'newHandle1'
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });

  test('Change to existing user\'s handle', () => {
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
        email: 'original@gmail.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'firstlast123length20'
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Handle error returns', () => {
  test('Invalid handle length', () => {
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

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'fi'
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invaid handle characters', () => {
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

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'fir!rgse'
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invaid handle type', () => {
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

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: true
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Handle is used by another user', () => {
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
    // ======================== SET UP END ===========================
    const res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'userlast'
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[0].token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});

describe('Token error returns', () => {
  test('Non-existent token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA';

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'newHandle'
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invaid token type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'original@email.com',
        password: 'password',
        nameFirst: 'First',
        nameLast: 'Last',
      }
    });

    const badToken: any = { token: 1 };
    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'newHandle'
      },
      headers: {
        'Content-type': 'application/json',
        token: badToken.token,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
