import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

const GLOBAL = 1;
const MEMBER = 2;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Successful return', () => {
  test('Change to global owner', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual({});
  });

  test('Change to member owner', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: MEMBER
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual({});
  });

  test('Global owner to member, other global owners present', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authToken: string = authUser.token;
    const authUserId: number = authUser.authUserId;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userToken: string = user.token;
    const userId: number = user.authUserId;

    // Change user to GLOBAL owner
    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });

    // Change authUser to MEMBER
    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: authUserId,
        permissionId: MEMBER
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual({});
  });
});

describe('Errors', () => {
  test('Error: token is not global owner', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authUserId: number = authUser.authUserId;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userToken: string = user.token;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: authUserId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });

  test('Error: uId is incorrect type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: 'abc',
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: uId is not valid', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const dummyUserId: number = user.authUserId + 1;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: dummyUserId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: token is not valid', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA';

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId + 1;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });

  test('Error: no other users created', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: -1,
        permissionId: GLOBAL
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: permissionId is incorrect type', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: 'abc'
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: permissionId is not valid', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: 3
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(OK);
  });

  test('Error: changing to user\'s current permissionId (global)', () => {let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'auth@gmail.com',
      password: 'password',
      nameFirst: 'Auth',
      nameLast: 'Last',
    }
  });
  const authUser: any = JSON.parse(res.getBody() as string);
  const token: string = authUser.token;
  const authUserId: number = authUser.authUserId;

  res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
    json: {
      uId: authUserId,
      permissionId: GLOBAL
    },
    headers: {
      'Content-type': 'application/json',
      token: token
    }
  });
  expect(res.statusCode).toEqual(BADREQUEST);
});

  test('Error: changing to user\'s current permissionId (member)', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: userId,
        permissionId: MEMBER
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: token user changing to member, no other global owners', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const token: string = authUser.token;
    const authUserId: number = authUser.authUserId;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      }
    });

    res = request('POST', `${url}:${port}/admin/userpermission/change/v1`, {
      json: {
        uId: authUserId,
        permissionId: MEMBER
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });
});
