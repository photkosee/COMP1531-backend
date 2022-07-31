import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;

const port = config.port;
const url = config.url;

const AUTH = 0;
const USER = 1;

const registeredUser: any = [
  { email: 'auth@gmail.com', password: 'password', nameFirst: 'Auth', nameLast: 'Last' },
  { email: 'user@gmail.com', password: 'password', nameFirst: 'User', nameLast: 'Last' }
];

let userData: any = [];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  userData = [];
  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    userData.push({ authUserId: data.authUserId, token: data.token });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Successfully return workplaceStats', () => {
  test('Successfully return workplaceStats initial', () => {
    const res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        workplaceStats: {
          channelsExist: [
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number)
            }
          ],
          dmsExist: [
            {
              numDmsExist: 0,
              timeStamp: expect.any(Number)
            }
          ],
          messagesExist: [
            {
              numMessagesExist: 0,
              timeStamp: expect.any(Number)
            }
          ],
          utilizationRate: 0
        },
      }
    );
  });

  test('Successful: Testing channels', () => {
    let res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel1',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token,
      }
    });
    const channel1: any = JSON.parse(res.getBody() as string);
    const channelId1 = channel1.channelId;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      json: {
        name: 'channel2',
        isPublic: true
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token,
      }
    });

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: channelId1
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token,
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelId1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });

    res = request('POST', `${url}:${port}/channel/leave/v2`, {
      json: {
        channelId: channelId1,
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: userData[USER].authUserId
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });
    expect(res.statusCode).toEqual(OK);

    res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        workplaceStats: {
          channelsExist: [
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number)
            },
            {
              numChannelsExist: 1,
              timeStamp: expect.any(Number)
            },
            {
              numChannelsExist: 2,
              timeStamp: expect.any(Number)
            }
          ],
          dmsExist: [
            {
              numDmsExist: 0,
              timeStamp: expect.any(Number)
            }
          ],
          messagesExist: [
            {
              numMessagesExist: 0,
              timeStamp: expect.any(Number)
            },
            {
              numMessagesExist: 1,
              timeStamp: expect.any(Number)
            }
          ],
          utilizationRate: 1
        }
      }
    );
  });

  test('Successful: Testing dms', () => {
    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [userData[AUTH].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const dmCreate: any = JSON.parse(res.getBody() as string);
    const dmId: number = dmCreate.dmId;

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [userData[USER].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const dmCreate2: any = JSON.parse(res.getBody() as string);
    const dmId2: number = dmCreate2.dmId;

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmId2,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);

    res = request('POST', `${url}:${port}/dm/leave/v2`, {
      body: JSON.stringify({
        dmId: dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);

    res = request('DELETE', `${url}:${port}/dm/remove/v2`, {
      qs: {
        dmId: dmId2
      },
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'extra@email.com',
        password: 'password',
        nameFirst: 'Extra',
        nameLast: 'user',
      }
    });

    res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        workplaceStats: {
          channelsExist: [
            {
              numChannelsExist: 0,
              timeStamp: expect.any(Number)
            }
          ],
          dmsExist: [
            {
              numDmsExist: 0,
              timeStamp: expect.any(Number)
            },
            {
              numDmsExist: 1,
              timeStamp: expect.any(Number)
            },
            {
              numDmsExist: 2,
              timeStamp: expect.any(Number)
            },
            {
              numDmsExist: 1,
              timeStamp: expect.any(Number)
            }
          ],
          messagesExist: [
            {
              numMessagesExist: 0,
              timeStamp: expect.any(Number)
            },
            {
              numMessagesExist: 1,
              timeStamp: expect.any(Number)
            },
            {
              numMessagesExist: 2,
              timeStamp: expect.any(Number)
            },
            {
              numMessagesExist: 1,
              timeStamp: expect.any(Number)
            }
          ],
          utilizationRate: 0.3333333333333333
        },
      }
    );
  });
});

describe('Errors', () => {
  test('Error: Invalid token', () => {
    const res = request('GET', `${url}:${port}/users/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ1Y0QzVjJLN01PU1RHTU1WWVFtbHBlc1UvZWwuTjB3SDZ0d3laY0VhZThjekUvcktkV2F0RyIsImlhdCI6MTY1ODU3NzcyNn0.7AWJbHt9-LMfsQiXHpY0exa9gL0yqsvQoPzIYNQAeUY'
      }
    });
    expect(res.statusCode).toEqual(FORBIDDEN);
  });
});
