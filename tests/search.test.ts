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

test('Testing for invalid token - search', () => {
  const res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: 'hello'
    },
    headers: {
      'Content-type': 'application/json',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ1Y0QzVjJLN01PU1RHTU1WWVFtbHBlc1UvZWwuTjB3SDZ0d3laY0VhZThjekUvcktkV2F0RyIsImlhdCI6MTY1ODU3NzcyNn0.7AWJbHt9-LMfsQiXHpY0exa9gL0yqsvQoPzIYNQAeUY'
    }
  });
  expect(res.statusCode).toStrictEqual(FORBIDDEN);
});
test('Testing for invalid query string in search - search', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: ''
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });

  expect(res.statusCode).toStrictEqual(BADREQUEST);
  const longStr = 'l'.repeat(1001);
  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: longStr
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for successful search in channel - search', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/message/send/v2`, {
    json: {
      channelId: channel1.channelId,
      message: 'Hi',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });

  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: 'h'
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toStrictEqual(OK);
});

test('Testing for successful search in dms - search', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'smith',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/dm/create/v2`, {
    json: {
      uIds: [user2.authUserId]
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  const dm1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/message/senddm/v2`, {
    json: {
      dmId: dm1.dmId,
      message: 'Hi',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });

  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: 'h'
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toStrictEqual(OK);
});

test('Testing for user not in channel/dm - search', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'smith',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'ben',
      nameLast: 'affleck',
    }
  });
  const user3 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/message/send/v2`, {
    json: {
      channelId: channel1.channelId,
      message: 'Hi',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  res = request('POST', `${url}:${port}/dm/create/v2`, {
    json: {
      uIds: [user2.authUserId]
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  const dm1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/message/senddm/v2`, {
    json: {
      dmId: dm1.dmId,
      message: 'Hi',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });

  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: 'h'
    },
    headers: {
      'Content-type': 'application/json',
      token: user3.token
    }
  });
  expect(res.statusCode).toStrictEqual(OK);

  res = request('GET', `${url}:${port}/search/v1`, {
    qs: {
      queryStr: 'b'
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  expect(res.statusCode).toStrictEqual(OK);
});
