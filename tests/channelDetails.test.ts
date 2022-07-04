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
} from '../src/channel';
import { authRegisterV1 } from '../src/auth';
import { channelsCreateV1 } from '../src/channels';
import { clearV1 } from '../src/other';
import { userProfileV1 } from '../src/users';

beforeEach(() => {
  clearV1();
});

describe('Return objects', () => {
  test('Valid inputs', () => {
    let user = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token = user.token;
    let channel = channelsCreateV1(token, 'FO9A_CRUNCHIE', false);
    let channelId = channel.channelId;

    const  res = request(
      'GET', `${url}:${port}/channel/details`, {
        qs: {
          token: token,
          channelId: channelId
        }
    });

    const data = JSON.parse(res.body() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({ 
      name: 'FO9A_CRUNCHIE',
      isPublic: false,
      ownerMembers: [{
        uId: user.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],
      allMembers: [{
        uId: user.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],    
    })
  });

  test('Testing if member but not owner', () => {
    let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token1 = user1.token;
    let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
    let token2 = user2.token;
    let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', true);
    let channelId = channel.channelId;
    channelJoinV1(token1, channelId);

    const res = request(
      'GET', `${url}:${port}/channel/details`, {
        json: {
          token: token2,
          channelId: channelId
        }
    });

    const data = JSON.parse(res.body() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'FO9A_CRUNCHIE',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'mal1@email.com',
        nameFirst: 'One',
        nameLast: 'Number',
        handleStr: 'onenumber'
      },
      {
        uId: user2.authUserId,
        email: 'mal2@email.com',
        nameFirst: 'Two',
        nameLast: 'Number',
        handleStr: 'twonumber'
      }],
    });
  });
});

describe('Return errors', () => {
  test('Return error tests', () => {
    let user1 = authRegisterV1('mal1@email.com', '1234567', 'One', 'Number');
    let token1 = user1.token;
    let user2 = authRegisterV1('mal2@email.com', '1234567', 'Two', 'Number');
    let token2 = user2.token;
    let user3 = authRegisterV1('mal3@email.com', '1234567', 'Three', 'Number');
    let token3 = user3.token;

    let channel = channelsCreateV1(token1, 'FO9A_CRUNCHIE', false);
    let channelId = channel.channelId;
    channelJoinV1(token2, channelId);

    let dummyToken = token1 + token2 + token3;
    let dummyChannelId = channelId + 1;

    const invalidPassData = [
      { token: dummyToken, channelId: channelId },
      { token: token1, channelId: dummyChannelId },
      { token: 'abc', channelId: channelId },
      { token: token1, channelId: 'abc' },
      { token: token3, channelId: channelId },
    ]

    for (const test in invalidPassData) {
      const res = request(
        'GET', `${url}:${port}/channel/details`, {
          json: {
            token: invalidPassData[test].token,
            channelId: invalidPassData[test].channelId
          }
      });
      const data = JSON.parse(res.body() as string);
      expect(res.statusCode).toBe(OK);
      expect(data).toStrictEqual({ error: 'error' });
    }
  });
});
