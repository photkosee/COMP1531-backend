import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

import {
    channelInviteV1,
    channelMessagesV1,
    channelJoinV1,
    channelDetailsV1
  } from '../src/channel.js';
  import { authRegisterV1 } from '../src/auth.js';
  import { channelsCreateV1 } from '../src/channels.js';
  import { clearV1 } from '../src/other.js';
  import { userProfileV1 } from '../src/users.js';

  describe('Valid returns', () => {
    test('Valid user id and valid channel id', () => {
      let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
      let token1 = user1.token;
      let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
      let token2 = user2.token;
      let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', true);
      let channelId = channel.channelId;

      const res = request(
        'POST', `${url}:${port}/channel/join`, {
          body: {
            token: token2,
            channelId: channelId
          }
      });

      const data = JSON.parse(res.body() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({});
    });

    test('Private channel, adding a global owner', () => {
      let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
      let token1 = user1.token;
      let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
      let token2 = user2.token;
      let channel = channelsCreateV1(token2, 'FO9A_CRUNCHIE', false);
      let channelId = channel.channelId;
  
      const res = request(
        'POST', `${url}:${port}/channel/join`, {
          json: {
            token: token1,
            channelId: channelId
          }
      });
      let data = JSON.parse(res.body() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({});
    });
  });

describe('Error returns', () => {
  test('Invalid tokens and ids', () => {
    let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token1 = user1.token;
    let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
    let token2 = user2.token;
    let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', true);
    let channelId = channel.channelId;

    const dummyChannelId = channelId + 1;
    const dummyToken = token1 + token2;

    const invalidPassData = [
      { token: dummyToken, channelId: channelId },
      { token: token1, channelId: dummyChannelId },
      { token: 'abc', channelId: channelId },
      { token: token1, channelId: 'abc' },
    ];

    for (const tets in invalidPassData) {
      const res = request(
        'POST', `${url}:${port}/channel/join`, {
          json: {
            token: invalidPassData[test].token,
            channelId: invalidPassData[test].channelId
          }
      });
      let data = JSON.parse(res.body() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ error: 'error' });
    }
  });
  
  test('Authorised user is already a member', () => {
    let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token1 = user1.token;
    let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
    let token2 = user2.token;
    let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', true);
    let channelId = channel.channelId;

    channelJoinV1(token2, channelId);

    const passData = [
      { token: token1, channelId: channelId },
      { token: token2, channelId: channelId },
    ];

    for (const tets in passData) {
      const res = request(
        'POST', `${url}:${port}/channel/join`, {
          json: {
            token: passData[test].token,
            channelId: passData[test].channelId
          }
      });
      let data = JSON.parse(res.body() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ error: 'error' });
    }
  });

  test('Private channel, adding not a global owner', () => {
    let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token1 = user1.token;
    let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
    let token2 = user2.token;
    let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', false);
    let channelId = channel.channelId;

    const res = request(
      'POST', `${url}:${port}/channel/join`, {
        json: {
          token: token2,
          channelId: channelId
        }
    });
    let data = JSON.parse(res.body() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({ error: 'error' });
  });
});