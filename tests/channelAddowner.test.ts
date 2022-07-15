import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

const addowner = (token: string, channelId: number, uId: number) => {
  const res = request('POST', `${url}:${port}/channel/addowner/v1`, {
    json: {
      token: token,
      channelId: channelId,
      uId: uId,
    }
  });
  expect(res.statusCode).toBe(OK);
  const bodyObj = JSON.parse(res.body as string);
  return bodyObj;
};

test('Testing for invalid channelId', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  expect(addowner(user1.token, 0.1, user2.authUserId)).toStrictEqual(ERROR);
  expect(addowner('randomString', 0.1, user2.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user1.token, 0.1, 0.1)).toStrictEqual(ERROR);
});
test('Testing for invalid uId and token', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  expect(addowner(user1.token, channel1.channelId, 0.1)).toStrictEqual(ERROR);
  expect(addowner('randomString', channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  res = request('GET', `${url}:${port}/channel/details/v2`, {
    qs: {
      token: user1.token,
      channelId: channel1.channelId,
    }
  });
  const channel1Details = JSON.parse(res.body as string);
  expect(channel1Details.allMembers.length).toStrictEqual(1);
  expect(channel1Details.ownerMembers.length).toStrictEqual(1);
});

test('Testing for token not in channel and uId already owner', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user3 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);

  expect(addowner(user2.token, channel1.channelId, user3.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user2.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: user2.token,
      channelId: channel1.channelId,
    }
  });

  expect(addowner(user2.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user2.token, channel1.channelId, user3.authUserId)).toStrictEqual(ERROR);
  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: user3.token,
      channelId: channel1.channelId,
    }
  });

  expect(addowner(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  expect(addowner(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  res = request('GET', `${url}:${port}/channel/details/v2`, {
    qs: {
      token: user1.token,
      channelId: channel1.channelId,
    }
  });
  const channel1Details = JSON.parse(res.body as string);
  expect(channel1Details.allMembers.length).toStrictEqual(3);
  expect(channel1Details.ownerMembers.length).toStrictEqual(2);
});

test('Testing for adding yourself', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user3 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: user2.token,
      channelId: channel1.channelId,
    }
  });
  expect(addowner(user1.token, channel1.channelId, user1.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user2.token, channel1.channelId, user2.authUserId)).toStrictEqual(ERROR);
  expect(addowner(user3.token, channel1.channelId, user3.authUserId)).toStrictEqual(ERROR);
  res = request('GET', `${url}:${port}/channel/details/v2`, {
    qs: {
      token: user1.token,
      channelId: channel1.channelId,
    }
  });
  const channel1Details = JSON.parse(res.body as string);
  expect(channel1Details.allMembers.length).toStrictEqual(2);
  expect(channel1Details.ownerMembers.length).toStrictEqual(1);
});

test('Testing successful addowner', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: 'password1',
      nameFirst: 'john',
      nameLast: 'smith',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: 'password2',
      nameFirst: 'ben',
      nameLast: 'mitchel',
    }
  });
  const user2 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user3@email.com',
      password: 'password3',
      nameFirst: 'ajax',
      nameLast: 'virn',
    }
  });
  const user3 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: user2.token,
      channelId: channel1.channelId,
    }
  });
  request('POST', `${url}:${port}/channel/join/v2`, {
    json: {
      token: user3.token,
      channelId: channel1.channelId,
    }
  });

  expect(addowner(user1.token, channel1.channelId, user2.authUserId)).toStrictEqual({});
  expect(addowner(user2.token, channel1.channelId, user3.authUserId)).toStrictEqual({});
});
