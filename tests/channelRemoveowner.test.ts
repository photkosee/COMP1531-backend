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

const removeOwner = (token: string, channelId: number, uId: number) => {
  const res = request('POST', `${url}:${port}/channel/removeowner/v2`,
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    }
  );
  return res;
};

test('Testing for invalid channelId', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  expect(removeOwner(user1.token, 0.1, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
  expect(removeOwner('randomString', 0.1, user2.authUserId).statusCode).toStrictEqual(FORBIDDEN);
});

test('Testing for invalid uId and token', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);
  expect(removeOwner(user1.token, channel1.channelId, 0.1).statusCode).toStrictEqual(BADREQUEST);
  expect(removeOwner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for token not in channel and uId not owner', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
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
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user2.token
    }
  });
  expect(removeOwner(user2.token, channel1.channelId, user3.authUserId).statusCode).toStrictEqual(BADREQUEST);
  expect(removeOwner(user2.token, channel1.channelId, user1.authUserId).statusCode).toStrictEqual(FORBIDDEN);
  expect(removeOwner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
  request('POST', `${url}:${port}/channel/addowner/v2`, {
    json: {
      channelId: channel1.channelId,
      uId: user2.authUserId
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });

  expect(removeOwner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(OK);
  expect(removeOwner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for remove last person and remove yourself', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user3 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user4@email.com',
      password: 'password4',
      nameFirst: 'bentley',
      nameLast: 'glass',
    }
  });
  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user2.token
    }
  });
  request('POST', `${url}:${port}/channel/addowner/v2`, {
    json: {
      channelId: channel1.channelId,
      uId: user2.authUserId
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user3.token
    }
  });
  expect(removeOwner(user2.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(OK);
  expect(removeOwner(user1.token, channel1.channelId, user1.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for successful remove owner', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  res = request('POST', `${url}:${port}/channels/create/v3`, {
    json: {
      name: 'channel1',
      isPublic: true,
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user2.token
    }
  });

  request('POST', `${url}:${port}/channel/addowner/v2`, {
    json: {
      channelId: channel1.channelId,
      uId: user2.authUserId
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token
    }
  });

  expect(removeOwner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(OK);
});
