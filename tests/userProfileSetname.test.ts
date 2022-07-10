import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Valid return', () => {
  test('Return empty object', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: token,
        nameFirst: 'Updated First Name8',
        nameLast: 'Updated Last Name',
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({});
  });
});

describe('Error returns', () => {
  test('Invalid name types', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: token,
        nameFirst: 123,
        nameLast: 'Updated Last Name',
      }
    });
    let data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);

    res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: token,
        nameFirst: 'Updated First Name',
        nameLast: false,
      }
    });
    data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Invalid name length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: token,
        nameFirst: '',
        nameLast: 'aiyezzhmoohrgdbojdgkwcnjrwkjabziyxqvkzwffsckxylgaxt',
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Non-existent token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;
    const dummyToken = token + 'abc';

    res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: dummyToken,
        nameFirst: 'Jacinta',
        nameLast: 'Chang',
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });

  test('Incorrect token type', () => {
    request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Original First Name!',
        nameLast: 'Original Last Name',
      }
    });

    const res = request('PUT', `${url}:${port}/user/profile/setname/v1`, {
      json: {
        token: 0,
        nameFirst: 'Jacinta',
        nameLast: 'Chang',
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual(ERROR);
  });
});
