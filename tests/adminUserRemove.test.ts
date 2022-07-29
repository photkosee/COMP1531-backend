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

describe('Successfully return {}', () => {
  test.only('Successful: found by userProfile, changed channel messages,' +
  'changed dm messages and removed with users/all', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'auth@gmail.com',
        password: 'password',
        nameFirst: 'Auth',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const authUser: any = JSON.parse(res.getBody() as string);
    const authUserId: string = authUser.authUserId;
    const authToken: string = authUser.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user: any = JSON.parse(res.getBody() as string);
    const userId: number = user.authUserId;
    const userToken: string = user.token;

    //////////////////////// CREATE CHANNEL, SEND MESSAGE ///////////////////
    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel1',
        isPublic: true,
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken,
      }
    });
    const channel = JSON.parse(res.body as string);
    const channelId = channel.channelId;

    res = request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken,
      }
    }
    );

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    const message = JSON.parse(res.getBody() as string);
    const messageId = message.messageId;
    //////////////////////// CREATE DM, SEND MESSAGE ///////////////////
    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [userId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const dm = JSON.parse(res.getBody() as string);
    const dmId = dm.dmId;

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      json: {
        dmId: dmId,
        message: 'Howdy friends'
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    const dmMessage = JSON.parse(res.getBody() as string);
    const dmMessageId = dmMessage.messageId;
    /////////////////////// REMOVE //////////////////
    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: userId
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual({});

    ///////////// ALTERED CHANNEL MESSAGES ////////
    res = request('GET', `${url}:${port}/channel/messages/v3`, {
      qs: {
        channelId: channelId,
        start: 0,
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const channelMessages = JSON.parse(res.getBody() as string);
    expect(channelMessages).toStrictEqual({
      messages: [{
        messageId: messageId,
        uId: userId,
        message: 'Removed user',
        timeSent: expect.any(Number),
        reacts: expect.any(Array),
        isPinned: false

      }],
      start: 0,
      end: -1
    });

    ///////////////////// ALTERED DM /////////////////
    res = request(
      'GET', `${url}:${port}/dm/messages/v2`,
      {
        qs: {
          dmId: dmId,
          start: 0
        },
        headers: {
          'Content-type': 'application/json',
          token: authToken
        }
      }
    );
    const dmMessages = JSON.parse(res.getBody() as string);
    expect(dmMessages).toStrictEqual({
      messages: [{
        messageId: dmMessageId,
        uId: userId,
        message: 'Removed user',
        timeSent: expect.any(Number),
        reacts: expect.any(Array),
        isPinned: false

      }],
      start: 0,
      end: -1
    });

      /////////////////// FIND USER PROFILE ///////////////
    res = request('GET', `${url}:${port}/user/profile/v3`, {
      qs: {
        uId: userId
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    }
    );
    const userProfile: any = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(userProfile).toStrictEqual({
      user: {
        uId: userId,
        email: 'user@gmail.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: expect.any(String),
        profileImgUrl: expect.any(String),
      }
    });

    ////////////////// USERS ALL /////////////////
    res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const usersAll = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(usersAll).toStrictEqual(
      { users: [
        {
          uId: authUserId,
          email: 'auth@gmail.com',
          nameFirst: 'Auth',
          nameLast: 'Last',
          handleStr: expect.any(String)
        }
      ]}
    );

    //////////////// NO CHANNEL MEMBERS OR OWNERS /////////////////
    res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken,
      }
    });
    const channelDetails = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelDetails).toStrictEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [{
        uId: authUserId,
        email: 'auth@gmail.com',
        nameFirst: 'Auth',
        nameLast: 'Last',
        handleStr: 'authlast'
      }],
      allMembers: [{
        uId: authUserId,
        email: 'auth@gmail.com',
        nameFirst: 'Auth',
        nameLast: 'Last',
        handleStr: 'authlast'
      }],
    });
  });
});
/*
  test('Successful: can reuse email', () => {});

  test('Successful: can reuse handle', () => {});
});

describe('Errors', () => {
  test('Error: Invalid token', => {});

  test('Error: Non-existed uId', => {});

  test('Error: Incorrect uId type', => {});

  test('Error: Authorised user is not global owner', => {});

  test('Error: Incorrect uId type', => {});

});
*/