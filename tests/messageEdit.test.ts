import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'anand', nameLast: 'Singh' },
  { email: 'mrjgidul907@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mriuffhdul', nameLast: 'Rathor' },
];

beforeEach(() => {
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

describe('Testing success editing and removing message - message/edit/v2', () => {
  test('Channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'Onse',
        nameLast: 'Numdber',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: 1
        },
        headers: {
          'Content-type': 'application/json',
          token: token2
        }
      }
    );

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'zzz'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({});

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 2,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({});
  });

  test('Dm', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[2].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const bodyObj2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj2.dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'zzz'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const message2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message2).toStrictEqual({});

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 2,
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const message3 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(message3).toStrictEqual({});
  });
});

describe('Testing for error - message/edit/v2', () => {
  test('Invalid message length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'PUHHXHkbkyhQMCLBuezy1F1AhhYYebte3tMOlpLwH3ZsacY2PFRdjE0f0XG4SZIGiLeZJooJIMNBFGd9ybfakqH3MtZwu4YROi0BgKKLs6BGylyNEOFKszlzFTqpX1R0sZcDsyzjOdWGmvGysz0xRerdGDX8xh49SI8BBuEDtwJPfXaXBGkN02dFPdDvcU7DjGEkBlqck4QKyAnxcrWIfgMTHXEgyGBturZVVOnNwOxkV5ifD83yMRKETyhRLErRLEcHqtltbALJYxBKTpuVhFgg7eWewSmqeeSWtPwqZqPpJVZW0uV8dnnkftaFUl5vYFaijgaAfK9NH6DQTmSENpxexRrVAH0j0IHbUBmQyrTPLimnfg9DbHruiyr8UxaCLsw7mEfHn0v1SDvaQXNFiDdTMHKQ12v0B0jSVFk5jgjtf3JtETPoZv9p0GFOggfjtqTd2ycKNCcKLmfis2XXisDYsVfSGKW7GwW30wIrMF6yuCsYYeMsBxywwIVyW6cQPNcCHXYJQRvenomkq84IzcAMfBOXogvy8YdWW7iuTGoox4QS4WE0yNoR0i1ZFg4WPXqqgdMfaDrnFYsjYyh2SuSVMcINE4rNl4YRrGrVXxubWoLXrc27mWozqLMT8nx4y33Br4ppy9yNAeOc8arkkYwQDdnVo7Jd1O8mkVMSUThbaiIu0vqDkkp7KsRiGzeLbUuCFb6ZFRiTixMaITdbJDq2fPTeZrMVGFRdgB9iisR1gkw8a1YU7H5gQEkq3K4m2KTl59pwAOtsLklW211WKdHLCFGrruBJHDg8m75TTiyPdwv5nECVv4LM8gZg8OLlNA4YyL8hlXDDRfNcpSlVRFZAqwL7cVVs1BZXz4ipUZVR5jUjcChrQy0vk9hRA80tvlMCPo03DDMulMp1fvBhVX4NJ667M2dwmGLw1slAk5akHUMuh0QVo6hWnlZ3N1WlaAmCqYO5lelUIrspOgs994jlJPZrrvs8fUZhCYoE4'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid messageId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 2,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission channel', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[0].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const bodyObj0 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj0.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });

    res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
