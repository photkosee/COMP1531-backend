import request from 'sync-request';
import config from '../src/config.json';

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

describe('Errors', () => {
  test('Error: Invalid token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0';

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: userId
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });

  test('Error: Non-existed uId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authToken: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: -1
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: Incorrect uId type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authToken: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: false
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: Authorised user is not global owner', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authId: number = authUser.authUserId;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userToken: string = user.token;

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: authId
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });
});
