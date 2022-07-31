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

describe('Testing for error - message/sendlaterdm/v1', () => {
  test('Invalid message length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user1@email.com',
        password: 'password1',
        nameFirst: 'John',
        nameLast: 'Smith',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: 'password2',
        nameFirst: 'ben',
        nameLast: 'kiin',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId],
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const dm1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dm1.dmId,
        message: '',
        timeSent: Math.floor(Date.now() / 1000) + 1
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid dmId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mail1@email.com',
        password: 'password1',
        nameFirst: 'John',
        nameLast: 'Smith',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: 1,
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000)
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: 'password1',
        nameFirst: 'John',
        nameLast: 'Smith',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: 'password2',
        nameFirst: 'ben',
        nameLast: 'kiin',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId],
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const dm1 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dm1.dmId,
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000)
      },
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQxb3NPMG8wb1JrTmVEUllidzRIbUxlRDJXVnRDU0dMTk5yU2FBQm5XVUZJZlhSdHRzZkNJRyIsImlhdCI6MTY1ODU3NzcwNn0.LTPtFI_oV8D4YuSWnWJCMrrYFB6jTt_AOVM3M_c8k3Y'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member of dm', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: 'password1',
        nameFirst: 'John',
        nameLast: 'Smith',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: 'password2',
        nameFirst: 'ben',
        nameLast: 'kiin',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user2 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal3@email.com',
        password: 'password3',
        nameFirst: 'matt',
        nameLast: 'parr',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user3 = JSON.parse(res.body as string);
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      json: {
        uIds: [user2.authUserId]
      },
      headers: {
        'Content-type': 'application/json',
        token: user1.token
      }
    });
    const dm1 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dm1.dmId,
        message: 'sdfgsdg',
        timeSent: Math.floor(Date.now() / 1000)
      },
      headers: {
        'Content-type': 'application/json',
        token: user3.token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

test('Successful messageSendlaterdm - message/sendlaterdm', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'kiin',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/dm/create/v2`, {
    json: {
      uIds: [user2.authUserId],
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const dm1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
    json: {
      dmId: dm1.dmId,
      message: 'sdfgsdg',
      timeSent: Math.floor(Date.now() / 1000) + 1
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(OK);
});

test('Timesent is before current time - message/sendlaterdm', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal1@email.com',
      password: 'password1',
      nameFirst: 'John',
      nameLast: 'Smith',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'mal2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'kiin',
    },
    headers: {
      'Content-type': 'application/json',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/dm/create/v2`, {
    json: {
      uIds: [user2.authUserId],
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const dm1 = JSON.parse(res.body as string);

  res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
    json: {
      dmId: dm1.dmId,
      message: 'sdfgsdg',
      timeSent: Math.floor(Date.now() / 1000) - 100
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);
});
