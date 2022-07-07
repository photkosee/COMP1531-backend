import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
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
  const bodyObj = JSON.parse(String(res.getBody()));
  return bodyObj;
};

test('Testing for invalid channelId', () => {
  let res = channelMessages('randomToken', 2, 3);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);

  const user1 = JSON.parse(request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@bar.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  }).getBody() as string);
  res = channelMessages(user1.token, 0.1, 0);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
  res = channelMessages('randomToken', 0.1, 0);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
});
test('Testing for invalid start parameter', () => {
  const user1 = JSON.parse(request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@bar.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  }).getBody() as string);
  const channel1 = JSON.parse(request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  }).getBody() as string);
  let res = channelMessages(user1.token, channel1.channelId, 0.1);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
  res = channelMessages(user1.token, channel1.channelId, -1);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
  res = channelMessages(user1.token, channel1.channelId, 2);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
});
test('Testing for correct no. messages return', () => {
  const user1 = JSON.parse(request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@bar.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  }).getBody() as string);
  const channel1 = JSON.parse(request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  }).getBody() as string);

  const res = channelMessages(user1.token, channel1.channelId, 0).start;
  expect(res.start).toStrictEqual(0);
  expect(res.end).toStrictEqual(-1);
  expect(res.messages.length).toStrictEqual(0);
  expect(res.statusCode).toBe(OK);
});
test('Testing for token not in channel or invalid', () => {
  const user1 = JSON.parse(request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user1@bar.com',
      password: '123456',
      nameFirst: 'first1',
      nameLast: 'last1',
    }
  }).getBody() as string);
  const user2 = JSON.parse(request('POST', `${url}:${port}/auth/register/v2`, {
    json: {
      email: 'user2@bar.com',
      password: '123456',
      nameFirst: 'first2',
      nameLast: 'last2',
    }
  }).getBody() as string);
  const channel1 = JSON.parse(request('POST', `${url}:${port}/channels/create/v2`, {
    json: {
      token: user1.token,
      name: 'channel1',
      isPublic: true,
    }
  }).getBody() as string);

  const res = channelMessages(user2.token, channel1.channelId, 0);
  expect(res).toStrictEqual(ERROR);
  expect(res.statusCode).toBe(OK);
});
