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
  test('Successful: found by userProfile, changed channel messages,' +
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
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelId,
        message: 'hello'
      }),
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const message1 = JSON.parse(res.getBody() as string);
    const messageId1 = message1.messageId;

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
        message: 'Who is it?'
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const dmMessage1 = JSON.parse(res.getBody() as string);
    const dmMessageId1 = dmMessage1.messageId;

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
      messages: [
        {
          messageId: messageId,
          uId: userId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        },
        {
          messageId: messageId1,
          uId: authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        }
      ],
      start: 0,
      end: -1
    });

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
      messages: [
        {
          messageId: dmMessageId,
          uId: userId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        },
        {
          messageId: dmMessageId1,
          uId: authUserId,
          message: 'Who is it?',
          timeSent: expect.any(Number),
          reacts: expect.any(Array),
          isPinned: false
        }
      ],
      start: 0,
      end: -1
    });

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

    res = request('GET', `${url}:${port}/users/all/v2`, {
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    const usersAll = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(usersAll).toStrictEqual(
      {
        users: [
          {
            uId: authUserId,
            email: 'auth@gmail.com',
            nameFirst: 'Auth',
            nameLast: 'Last',
            handleStr: expect.any(String)
          }
        ]
      }
    );

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

  test('Successful: can register same email', () => {
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

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'new@gmail.com',
        password: 'password',
        nameFirst: 'User',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    expect(res.statusCode).toEqual(OK);
  });

  test('Successful: can register same handle', () => {
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

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'user@gmail.com',
        password: 'password',
        nameFirst: 'New',
        nameLast: 'Last',
      },
      headers: {
        'Content-type': 'application/json',
      }
    });
    expect(res.statusCode).toEqual(OK);
  });

  test('Successful: can reuse handle', () => {
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

    res = request('PUT', `${url}:${port}/user/profile/sethandle/v2`, {
      json: {
        handleStr: 'userlast',
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(OK);
  });

  test('Successful: can reuse email', () => {
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

    res = request('PUT', `${url}:${port}/user/profile/setemail/v2`, {
      json: {
        email: 'user@gmail.com',
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(OK);
  });

  test('Successfully remove a channel owner', () => {
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
    const authToken: string = authUser.token;
    const authUserId: number = authUser.authUserId;

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

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel1',
        isPublic: true,
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken,
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
        token: authToken,
      }
    });

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
      ownerMembers: [],
      allMembers: [{
        uId: authUserId,
        email: 'auth@gmail.com',
        nameFirst: 'Auth',
        nameLast: 'Last',
        handleStr: 'authlast'
      }],
    });
  });

  test('Successful DM creator is removed', () => {
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
    const authToken: string = authUser.token;
    const authUserId: number = authUser.authUserId;

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

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });

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
  });
});

describe('Errors', () => {
  test('Error: Invalid token', () => {
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
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0';

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

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: userId
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });

  test('Error: Non-existed uId', () => {
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

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: -1
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: Incorrect uId type', () => {
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

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: false
      },
      headers: {
        'Content-type': 'application/json',
        token: authToken
      }
    });
    expect(res.statusCode).toEqual(BADREQUEST);
  });

  test('Error: Authorised user is not global owner', () => {
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
    const authId: number = authUser.authUserId;

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
    const userToken: string = user.token;

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: authId
      },
      headers: {
        'Content-type': 'application/json',
        token: userToken
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });
});
