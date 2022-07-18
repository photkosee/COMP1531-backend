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

const channelMessages = (token: string, channelId: number, start: number) => {
  const res = request('GET', `${url}:${port}/channel/messages/v2`,
    {
      qs: {
        token: token,
        channelId: channelId,
        start: start,
      }
    }
  );
  expect(res.statusCode).toBe(OK);
  const bodyObj = JSON.parse(String(res.body as string));

  return bodyObj;
};

test('Testing for invalid channelId', () => {
  let res = channelMessages('randomToken', 2, 3);
  expect(res).toStrictEqual(ERROR);

  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);

  res = channelMessages(user1.token, 0.1, 0);
  expect(res).toStrictEqual(ERROR);
  res = channelMessages('randomToken', 0.1, 0);
  expect(res).toStrictEqual(ERROR);
});
test('Testing for invalid start parameter', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  res = channelMessages(user1.token, channel1.channelId, 0.1);
  expect(res).toStrictEqual(ERROR);
  res = channelMessages(user1.token, channel1.channelId, -1);
  expect(res).toStrictEqual(ERROR);
  res = channelMessages(user1.token, channel1.channelId, 2);
  expect(res).toStrictEqual(ERROR);
});
test('Testing for correct messages return', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  });
  const channel1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/message/send/v1`, {
    json: {
      token: user1.token,
      channelId: channel1.channelId,
      message: 'hello',
    }
  });
  res = request('POST', `${url}:${port}/message/send/v1`, {
    json: {
      token: user1.token,
      channelId: channel1.channelId,
      message: 'bye',
    }
  });

  expect(channelMessages(user1.token, channel1.channelId, 0)).toStrictEqual({
    messages:
  [
    { messageId: expect.any(Number), uId: user1.authUserId, message: 'bye', timeSent: expect.any(Number) },
    { messageId: expect.any(Number), uId: user1.authUserId, message: 'hello', timeSent: expect.any(Number) },
  ],
    start: 0,
    end: -1
  });

  expect(channelMessages(user1.token, channel1.channelId, 1).start).toStrictEqual(1);
  expect(channelMessages(user1.token, channel1.channelId, 1).end).toStrictEqual(-1);
  expect(channelMessages(user1.token, channel1.channelId, 1).messages.length).toStrictEqual(1);
});
test('Testing for token not in channel or invalid', () => {
  let res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@email.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  });
  const user1 = JSON.parse(res.body as string);
  res = request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@email.com',
      password: '123456',
      nameFirst: 'first2',
      nameLast: 'last2',
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
  const messagesResponse = channelMessages(user2.token, channel1.channelId, 0);
  expect(messagesResponse).toStrictEqual(ERROR);
});
