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

describe('Valid return', () => {
  test('Return empty object', () => {
    request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'authasd@gmail.com',
        password: 'password',
        nameFirst: 'Original 2First Name!',
        nameLast: 'Original 2Last Name',
      }
    });
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/login/v3`, {
      body: JSON.stringify({
        email: 'auth@gmail.com',
        password: 'password'
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'Updated First Name8',
        nameLast: 'Updated Last Name',
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

describe('Error returns', () => {
  test('Invalid name types', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 123,
        nameLast: 'Updated Last Name',
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'Updated First Name',
        nameLast: false,
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid name length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: '',
        nameLast: 'aiyezzhmoohrgdbojdgkwcnjrwkjabziyxqvkzwffsckxylgaxt',
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Non-existent token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA';

    res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'Jacinta',
        nameLast: 'Chang',
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Incorrect token type', () => {
    const badToken: any = { token: 0 };

    const res = request('PUT', `${url}:${port}/user/profile/setname/v2`, {
      json: {
        nameFirst: 'Jacinta',
        nameLast: 'Chang',
      },
      headers: {
        'Content-type': 'application/json',
        token: badToken.token,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
