import request from 'sync-request';
import config from '../src/config.json';

const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let dmIdList: any = [];
let channelIdList: any = [];
let messageIdList: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' },
  { email: 'rathor@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mridul', nameLast: 'Rathor' },
  { email: 'adam@gmail.com', password: 'uhud567T#$%', nameFirst: 'adam', nameLast: 'saund' },
];

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];
  dmIdList = [];
  channelIdList = [];
  messageIdList = [];

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

  const dmData: any = [
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId] },
    { token: registrationData[2].token, uIds: [registrationData[0].authUserId, registrationData[1].authUserId] },
  ];

  for (let i = 0; i < dmData.length; i++) {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...dmData[i].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: dmData[i].token
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    dmIdList.push(bodyObj.dmId);
  }

  for (let i = 0; i < dmData.length; i++) {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: dmData[i].token
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    channelIdList.push(bodyObj.channelId);
  }

  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channelIdList[0]
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[1].token
    }
  });

  let res = request('POST', `${url}:${port}/message/send/v2`, {
    body: JSON.stringify({
      channelId: channelIdList[0],
      message: 'abc'
    }),
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  let bodyObj = JSON.parse(res.body as string);
  messageIdList.push(bodyObj.messageId);

  res = request('POST', `${url}:${port}/message/senddm/v2`, {
    body: JSON.stringify({
      dmId: dmIdList[0],
      message: 'abc'
    }),
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token
    }
  });
  bodyObj = JSON.parse(res.body as string);
  messageIdList.push(bodyObj.messageId);

  res = request('POST', `${url}:${port}/message/send/v2`, {
    body: JSON.stringify({
      channelId: channelIdList[1],
      message: 'abc'
    }),
    headers: {
      'Content-type': 'application/json',
      token: registrationData[2].token
    }
  });
  bodyObj = JSON.parse(res.body as string);
  messageIdList.push(bodyObj.messageId);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing for error - message/edit/v2', () => {
  test('Invalid message length', () => {
    const res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        message: 'PUHHXHkbkyhQMCLBuezy1F1AhhYYebte3tMOlpLwH3ZsacY2PFRdjE0f0XG4SZIGiLeZJooJIMNBFGd9ybfakqH3MtZwu4YROi0BgKKLs6BGylyNEOFKszlzFTqpX1R0sZcDsyzjOdWGmvGysz0xRerdGDX8xh49SI8BBuEDtwJPfXaXBGkN02dFPdDvcU7DjGEkBlqck4QKyAnxcrWIfgMTHXEgyGBturZVVOnNwOxkV5ifD83yMRKETyhRLErRLEcHqtltbALJYxBKTpuVhFgg7eWewSmqeeSWtPwqZqPpJVZW0uV8dnnkftaFUl5vYFaijgaAfK9NH6DQTmSENpxexRrVAH0j0IHbUBmQyrTPLimnfg9DbHruiyr8UxaCLsw7mEfHn0v1SDvaQXNFiDdTMHKQ12v0B0jSVFk5jgjtf3JtETPoZv9p0GFOggfjtqTd2ycKNCcKLmfis2XXisDYsVfSGKW7GwW30wIrMF6yuCsYYeMsBxywwIVyW6cQPNcCHXYJQRvenomkq84IzcAMfBOXogvy8YdWW7iuTGoox4QS4WE0yNoR0i1ZFg4WPXqqgdMfaDrnFYsjYyh2SuSVMcINE4rNl4YRrGrVXxubWoLXrc27mWozqLMT8nx4y33Br4ppy9yNAeOc8arkkYwQDdnVo7Jd1O8mkVMSUThbaiIu0vqDkkp7KsRiGzeLbUuCFb6ZFRiTixMaITdbJDq2fPTeZrMVGFRdgB9iisR1gkw8a1YU7H5gQEkq3K4m2KTl59pwAOtsLklW211WKdHLCFGrruBJHDg8m75TTiyPdwv5nECVv4LM8gZg8OLlNA4YyL8hlXDDRfNcpSlVRFZAqwL7cVVs1BZXz4ipUZVR5jUjcChrQy0vk9hRA80tvlMCPo03DDMulMp1fvBhVX4NJ667M2dwmGLw1slAk5akHUMuh0QVo6hWnlZ3N1WlaAmCqYO5lelUIrspOgs994jlJPZrrvs8fUZhCYoE4'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid messageId', () => {
    const res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: -10,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
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
    const res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    const res = request('PUT', `${url}:${port}/message/edit/v2`, {
      body: JSON.stringify({
        messageId: messageIdList[1],
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/pin/v1', () => {
  test('Invalid messageId', () => {
    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: 1000
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Already pinned channel', () => {
    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Already pinned dm', () => {
    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('No permission channel', () => {
    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    const res = request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/react/v1', () => {
  test('Invalid messageId', () => {
    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 10000,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid reactId', () => {
    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: -5
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Already reacted channel', () => {
    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Already reacted dm', () => {
    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });

    const res = request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});

describe('Testing for error - message/remove/v2', () => {
  test('Invalid messageId', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 1000
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: 1
      },
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission channel', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: messageIdList[0]
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    const res = request('DELETE', `${url}:${port}/message/remove/v2`, {
      qs: {
        messageId: messageIdList[1]
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/send/v2', () => {
  test('Invalid message length', () => {
    const res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelIdList[0],
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid channelId', () => {
    const res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: -10,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQxb3NPMG8wb1JrTmVEUllidzRIbUxlRDJXVnRDU0dMTk5yU2FBQm5XVUZJZlhSdHRzZkNJRyIsImlhdCI6MTY1ODU3NzcwNn0.LTPtFI_oV8D4YuSWnWJCMrrYFB6jTt_AOVM3M_c8k3Y'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: channelIdList[1],
        message: 'sdfgsdg'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/senddm/v2', () => {
  test('Invalid message length', () => {
    const res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[0],
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid dmId', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    const res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: -5,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[1],
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR1WWtZNzh4MGVIMmFNQ0RZN0JZMXgubVEwUUo4cElaOXk5VEk5SFJ6NFhrYVRiU0xzS25PdSIsImlhdCI6MTY1ODU3NzY5N30.6tHgcav_HUnDzF7Y3uLRBvFaGCFKDYwKRICMZmMW36A'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmIdList[0],
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/share/v1', () => {
  test('Invalid dmId and channelId', () => {
    let res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[0],
        message: 'asdf',
        channelId: -5,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[1],
        message: 'asdf',
        channelId: -1,
        dmId: -5
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[0],
        message: 'asdf',
        channelId: -1,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[0],
        message: 'asdf',
        channelId: channelIdList[0],
        dmId: dmIdList[0]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid ogMessageId', () => {
    let res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: -5,
        message: 'asdf',
        channelId: channelIdList[1],
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: -5,
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid message length', () => {
    const res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[0],
        message: 'tYpl03WuT6YS2L4xmaGyg1beVNFIi73FvKG4BP04BzFv6EPWqRigRNUBtysEDLnccTPzyU2ptdv8a8cCCEospatVbVXryHKcVEF54xIV7c74uEfeGXLA156p1Ziil8JgZFt9o9JfWTRZr60pTq7vOvCxgqkYrGmExz2BpPmrFdx4AddiWlbPCOqaWxiwZdfq4n8JL3E0iiryNdLVFhPLLnH6fdzm9xhjo8gax9mEWrTShyxTEJIlL1eWWK2OtcEKKlqzsTdLQCJRlcFwf7tVDEca9jjb5Q9310dFZBBFNJkXPB6vkKz60NrVyFuLTbIUZWNbJ7Mrx9jH0OtYxkTZUyG2KTeCwsVyh8Rels2cYUxMGyd4ePw4BLqtzEJ2Fx0zIwzqHcJjxQZZAF61Pc7Vxn4AbS32yCoI239OIpg00A4XNDT7xJaayg5GD0h8PXb1dchNbYUsuDfIdb4NgE6NryDY5nBJE5NqbpQBW1euLFOxVVTU3zG5FKGbKUQX8k5KRgt1mQRruf57eKo8tQV0c3uUdVPu3Is1hyAQlkmJThxsR1raTuduVxqGWLrfbN5PPhMM45XP5XpDF0sye7MiP6WSqYm5Wh49nuT5wXw0zxeMc73CD7CQ7BbYiYZOAQHHmgDlKTG0wQjiGZv780MFThXYxsUDjIEa14k1vIB6FJtlthxtMI0nJFxcwH0d1jPcZ8dICJfS5xK3x5zjBGF8GeUMFqQhiUj1MywhpfauaVKJ8OvNMfj1ji712inncKcCmHfOzKPSTMRMPD3LaRVVF5TjLaP1NVHDiNKHMdVzJNkBGTrI5tR50VMkdDpFjx3wGxvKegXkQRFVf3xgMmsxlB4pYrzDJcGnhGrDKb9fuIalASD7uRXQ109imGCqHkLJZ8cbeCz4kZuZl3shZBSyuLX4ycjSWNwy1yTfGqWTfISBxe0CjfjKn4fdTreeLTSN742M7tH26lPrDesD8G59TTCA3ylWWyxhV6ubfbNJB',
        channelId: channelIdList[1],
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: 1,
        message: 'asdf',
        channelId: -1,
        dmId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR1WWtZNzh4MGVIMmFNQ0RZN0JZMXgubVEwUUo4cElaOXk5VEk5SFJ6NFhrYVRiU0xzS25PdSIsImlhdCI6MTY1ODU3NzY5N30.6tHgcav_HUnDzF7Y3uLRBvFaGCFKDYwKRICMZmMW36A'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member of channel/dm the user is sharing to', () => {
    let res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[1],
        message: 'asdf',
        channelId: channelIdList[1],
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageIdList[2],
        message: 'asdf',
        channelId: -1,
        dmId: dmIdList[0]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/unpin/v1', () => {
  test('Invalid messageId', () => {
    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 1000
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not a member', () => {
    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not already pinned channel', () => {
    request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not already pinned dm', () => {
    request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('No permission channel', () => {
    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('No permission dm', () => {
    request('POST', `${url}:${port}/message/pin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });

    const res = request('POST', `${url}:${port}/message/unpin/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[1]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Testing for error - message/unreact/v1', () => {
  test('Invalid messageId', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 1000,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: 1,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCR4M3drRGVCdEpSblJQOUdyRUNzUnlPVDVpU29OellIdVozc0ZRN29wbXpUN3Y0MzJNMXQ5bSIsImlhdCI6MTY1ODU3NzY4M30.pTjzScWD468f4umwPtoOundclYoDYEdSV_7YXqD7RmA'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid reactId', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: -5
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('No react channel', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('No react dm', () => {
    const res = request('POST', `${url}:${port}/message/unreact/v1`, {
      body: JSON.stringify({
        messageId: messageIdList[0],
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});

describe('Testing for error - message/sendlater/v1', () => {
  test('Invalid message length', () => {
    const res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: channelIdList[0],
        message: '',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid channelId', () => {
    let res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: 1000,
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: 1,
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQxb3NPMG8wb1JrTmVEUllidzRIbUxlRDJXVnRDU0dMTk5yU2FBQm5XVUZJZlhSdHRzZkNJRyIsImlhdCI6MTY1ODU3NzcwNn0.LTPtFI_oV8D4YuSWnWJCMrrYFB6jTt_AOVM3M_c8k3Y'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Not a member', () => {
    const res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: channelIdList[1],
        message: 'sdfgsdg',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('timeSent is before current time - message/sendlater', () => {
    const res = request('POST', `${url}:${port}/message/sendlater/v1`, {
      json: {
        channelId: channelIdList[0],
        message: 'sdfgsdg',
        timeSent: Math.floor(Date.now() / 1000) - 1000
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});

describe('Testing for error - message/sendlaterdm/v1', () => {
  test('Invalid message length', () => {
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[0],
        message: '',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
  
  test('Invalid dmId', () => {
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: 1000,
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
  
  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[0],
        message: 'asdf',
        timeSent: Math.floor(Date.now() / 1000) + 10
      },
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQxb3NPMG8wb1JrTmVEUllidzRIbUxlRDJXVnRDU0dMTk5yU2FBQm5XVUZJZlhSdHRzZkNJRyIsImlhdCI6MTY1ODU3NzcwNn0.LTPtFI_oV8D4YuSWnWJCMrrYFB6jTt_AOVM3M_c8k3Y'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
  
  test('Not a member of dm', () => {
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[0],
        message: 'sdfgsdg',
        timeSent: Math.floor(Date.now() / 1000) + 100
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
  
  test('Timesent is before current time - message/sendlaterdm', () => {
    const res = request('POST', `${url}:${port}/message/sendlaterdm/v1`, {
      json: {
        dmId: dmIdList[1],
        message: 'sdfgsdg',
        timeSent: Math.floor(Date.now() / 1000) - 100
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});
