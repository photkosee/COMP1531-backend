
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

const channelLeave = (token: string, channelId: number) => {
  const res = request('POST', `${url}:${port}/channel/leave/v2`, {
    json: {
      channelId: channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: token
    }
  });
  return res;
};

test('Testing for invalid input in channel/leave/v2', () => {
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
  expect(channelLeave(user1.token, 0.1).statusCode).toStrictEqual(BADREQUEST);
  expect(channelLeave('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0', 1).statusCode).toStrictEqual(FORBIDDEN);
});

test('Testing for user not in channel', () => {
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
  expect(channelLeave(user2.token, channel1.channelId).statusCode).toStrictEqual(FORBIDDEN);
});
