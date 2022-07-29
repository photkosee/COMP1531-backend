import request from 'sync-request';
import config from '../src/config';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;

const port = config.port;
const url = config.url;

const AUTH = 0;
const USER = 1;

const registeredUser: any = [
  { email: 'auth@gmail.com', password: 'password', nameFirst: 'Auth', nameLast: 'Last' },
  { email: 'user@gmail.com', password: 'password', nameFirst: 'User', nameLast: 'Last' }
];

const userData: any = [];

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const data: any = JSON.parse(res.getBody() as string);
    userData.push({ authUserId: data.authUserId, token: data.token });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Successful', () => {
  test('Successfully return userStats initial', () => {
    const res = request('GET', `${url}:${port}/user/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[AUTH].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        userStats: {
          channelsJoined: [{
            numChannelsJoined: 0,
            timeStamp: expect.any(Number)
          }],
          dmsJoined: [{
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }],
          messagesSent: [{
            numMessagesSent: 0,
            timeStap: expect.any(Number)
          }]
        }
      }
    );
  });

  test('Successful: Testinfg channels', () => {
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

    res = request('GET', `${url}:${port}/user/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        userStats: {
          channelsJoined: [
            {
              numChannelsJoined: 0,
              timeStamp: expect.any(Number)
            },
            {
              numChannelsJoined: 1,
              timeStamp: expect.any(Number)
            },
            {
              numChannelsJoined: 2,
              timeStamp: expect.any(Number)
            },
            {
              numChannelsJoined: 1,
              timeStamp: expect.any(Number)
            }
          ],
          dmsJoined: [{
            numDmsJoined: 0,
            timeStamp: expect.any(Number)
          }],
          messagesSent: [
            {
              numMessagesSent: 0,
              timeStap: expect.any(Number)
            },
            {
              numMessagesSent: 1,
              timeStap: expect.any(Number)
            }
          ]
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
    const dmCreate: any = JSON.parse(res.getBody() as string);
    const dmId: number = dmCreate.dmId;

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

    res = request('POST', `${url}:${port}/dm/leave/v2`, {
      body: JSON.stringify({
        dmId: dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: userData[USER]
      }
    });

    res = request('GET', `${url}:${port}/user/stats/v1`, {
      headers: {
        'Content-type': 'application/json',
        token: userData[USER].token
      }
    });
    expect(res.statusCode).toEqual(OK);
    const data: any = JSON.parse(res.getBody() as string);
    expect(data).toEqual(
      {
        userStats: {
          channelsJoined: [],
          dmsJoined: [
            {
              numDmsJoined: 0,
              timeStamp: expect.any(Number)
            },
            {
              numDmsJoined: 1,
              timeStamp: expect.any(Number)
            },
            {
              numDmsJoined: 0,
              timeStamp: expect.any(Number)
            }
          ],
          messagesSent: [
            {
              numMessagesSent: 0,
              timeStap: expect.any(Number)
            },
            {
              numMessagesSent: 1,
              timeStap: expect.any(Number)
            }
          ]
        }
      }
    );
  });
});
