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

const channelMessages = (token: string, channelId: number, start: number) => {
  const res = request('GET', `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: channelId,
        start: start,
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
  let res = channelMessages('randomToken', 2, 3);
  expect(res.statusCode).toStrictEqual(FORBIDDEN);

  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = channelMessages(user1.token, 0.1, 0);
  expect(res.statusCode).toStrictEqual(BADREQUEST);
  res = channelMessages('randomToken', 0.1, 0);
  expect(res.statusCode).toStrictEqual(FORBIDDEN);
});
test('Testing for invalid start parameter', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
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
  res = channelMessages(user1.token, channel1.channelId, -1);
  expect(res.statusCode).toStrictEqual(BADREQUEST);
  res = channelMessages(user1.token, channel1.channelId, 2);
  expect(res.statusCode).toStrictEqual(BADREQUEST);
});
test('Testing for correct order of messages returned', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
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
  res = request('POST', `${url}:${port}/message/send/v2`, {
    json: {
      channelId: channel1.channelId,
      message: 'hello',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  res = request('POST', `${url}:${port}/message/send/v2`, {
    json: {
      channelId: channel1.channelId,
      message: 'bye',
    },
    headers: {
      'Content-type': 'application/json',
      token: user1.token,
    }
  });
  expect(channelMessages(user1.token, channel1.channelId, 0).statusCode).toStrictEqual(OK);
  expect(channelMessages(user1.token, channel1.channelId, 1).statusCode).toStrictEqual(OK);
});
test('Testing for token not in channel or invalid', () => {
  let res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v3`, {
    json: {
      email: 'user2@email.com',
      password: '123456',
      nameFirst: 'first2',
      nameLast: 'last2',
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
      token: user1.token,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  expect(channelMessages(user2.token, channel1.channelId, 0).statusCode).toStrictEqual(FORBIDDEN);
});
