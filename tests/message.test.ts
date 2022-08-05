import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let channelIdList: any = [];
let dmIdList: any = [];
let msgIdList: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'anand', nameLast: 'Singh' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mriuffhdul', nameLast: 'Rathor' },
];

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];

  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing message - message', () => {
  channelIdList = [];
  dmIdList = [];
  msgIdList = [];

  test('Create channels and dms', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[2].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const dm1 = JSON.parse(res.body as string);
    dmIdList.push(dm1);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const dm2 = JSON.parse(res.body as string);
    dmIdList.push(dm2);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[0].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const ch1 = JSON.parse(res.body as string);
    channelIdList.push(ch1);

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: channelIdList[0].channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const ch2 = JSON.parse(res.body as string);
    channelIdList.push(ch2);

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: channelIdList[1].channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
  });

  test('Sending messages', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelIdList[0].channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelIdList[0].channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms2 = JSON.parse(res.body as string);
    msgIdList.push(ms2);
    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelIdList[1].channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms3 = JSON.parse(res.body as string);
    msgIdList.push(ms3);
    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[0].dmId,
        message: '@mjghridulanand abc '
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms4 = JSON.parse(res.body as string);
    msgIdList.push(ms4);
  });

  test('react and unreact', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });

  test('sharing and react to test if it is independent', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[1].dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms5 = JSON.parse(res.body as string);
    msgIdList.push(ms5);
    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[0].dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[2].messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[1].dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[3].messageId,
        message: 'asdf',
        channelId: channelIdList[0].channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[1].messageId,
        message: 'asdf',
        channelId: channelIdList[0].channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 5,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[0].messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[0].dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[2].messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[0].dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[1].messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[1].dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[1].messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[1].dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: msgIdList[3].messageId,
        message: 'asdf',
        channelId: channelIdList[1].channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });

  test('Pin and unpin', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 5
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 3
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 3
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 5
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });

  test('editing and removing', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'zzz @mjghridulanand'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 5,
        message: 'zzz @mjghridulanand'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 6,
        message: '@mjghridulanand'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 6,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 3
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });

  test('sendlater', async() => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    const res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: channelIdList[0].channelId,
        message: 'sdfgsdg',
        timeSent: (Math.floor(Date.now() / 1000) + 1.5)
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    expect(res.statusCode).toBe(OK);
  });

  test('sendlaterdm', async() => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[1].dmId,
        message: '@mriuffhdulrathor',
        timeSent: (Math.floor(Date.now() / 1000) + 1.5)
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    expect(res.statusCode).toBe(OK);
  });

  test('sendlaterdm and removing', async() => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];
    let res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[0].dmId,
        message: '@mjghridulanand',
        timeSent: (Math.floor(Date.now() / 1000) + 1.5)
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });

    await new Promise((r) => setTimeout(r, 2500));

    expect(res.statusCode).toBe(OK);

    res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 5
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });

  test('removing user', () => {
    let res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: registrationData[1].authUserId
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toEqual(OK);

    res = request('DELETE', `${url}:${port}/admin/user/remove/v1`, {
      qs: {
        uId: registrationData[2].authUserId
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toEqual(OK);
  });
});
