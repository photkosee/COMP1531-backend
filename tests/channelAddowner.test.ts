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

const addowner = (token: string, channelId: number, uId: number) => {
  const res = request('POST', `${url}:${port}/channel/addowner/v2`, {
    json: {
      channelId: channelId,
      uId: uId,
    },
    headers: {
      'Content-type': 'application/json',
      token: token
    }
  });
  return res;
};

test('Testing for invalid channelId', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    },
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
  expect(addowner(user1.token, 0.1, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
  expect(addowner('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0', 1, user2.authUserId).statusCode).toStrictEqual(FORBIDDEN);
  expect(addowner(user1.token, 0.1, 0.1).statusCode).toStrictEqual(BADREQUEST);
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
  expect(addowner(user1.token, channel1.channelId, 0.1).statusCode).toStrictEqual(BADREQUEST);
  expect(addowner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for token not in channel and uId already owner', () => {
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
  expect(addowner(user3.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(FORBIDDEN);
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user3.token
    }
  });
  expect(addowner(user2.token, channel1.channelId, user3.authUserId).statusCode).toStrictEqual(FORBIDDEN);
  expect(addowner(user2.token, channel1.channelId, user1.authUserId).statusCode).toStrictEqual(BADREQUEST);

  expect(addowner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(OK);
  expect(addowner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing for adding yourself', () => {
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
      token: user1.token
    }
  });
  expect(addowner(user1.token, channel1.channelId, user1.authUserId).statusCode).toStrictEqual(BADREQUEST);
  expect(addowner(user2.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(BADREQUEST);
  expect(addowner(user3.token, channel1.channelId, user3.authUserId).statusCode).toStrictEqual(BADREQUEST);
});

test('Testing successful addowner', () => {
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
  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channel1.channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: user3.token
    }
  });

  expect(addowner(user1.token, channel1.channelId, user2.authUserId).statusCode).toStrictEqual(OK);
  expect(addowner(user2.token, channel1.channelId, user3.authUserId).statusCode).toStrictEqual(OK);
});
