import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let channelIdList: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' },
  { email: 'rathor@gmail.com', password: 'uhudfnr567T#$%', nameFirst: 'Mridul', nameLast: 'Rathor' },
  { email: 'adam@gmail.com', password: 'uhud567T#$%', nameFirst: 'adam', nameLast: 'saund' },
];

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];
  channelIdList = [];

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

  for (let i = 0; i < 3; i++) {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[i].token
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

  request('POST', `${url}:${port}/channel/join/v3`, {
    json: {
      channelId: channelIdList[1]
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[2].token
    }
  });
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

const addowner = (token: string, channelId: number, uId: number) => {
  const res = request('POST', `${url}:${port}/channel/addowner/v2`, {
    json: {
      channelId: channelId,
      uId: uId,
    },
    headers: {
      'Content-type': 'application/json',
      token: token
    }
  });
  return res;
};

const removeOwner = (token: string, channelId: number, uId: number) => {
  const res = request('POST', `${url}:${port}/channel/removeowner/v2`,
    {
      json: {
        channelId: channelId,
        uId: uId,
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    }
  );
  return res;
};

const channelMessages = (token: string, channelId: number, start: number) => {
  const res = request('GET', `${url}:${port}/channel/messages/v3`,
    {
      qs: {
        channelId: channelId,
        start: start,
      },
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    }
  );
  return res;
};

const channelLeave = (token: string, channelId: number) => {
  const res = request('POST', `${url}:${port}/channel/leave/v2`, {
    json: {
      channelId: channelId,
    },
    headers: {
      'Content-type': 'application/json',
      token: token
    }
  });
  return res;
};

describe('Successfully listing channels - channels/list/v3', () => {
  test('Listing no channels', () => {
    const response = request('GET', `${url}:${port}/channels/list/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    const channelList = JSON.parse(response.getBody() as string);
    expect(response.statusCode).toBe(OK);
    expect(channelList).toStrictEqual({
      channels: [{
        channelId: channelIdList[0],
        name: 'DOTA2'
      },
      {
        channelId: channelIdList[1],
        name: 'DOTA2'
      }]
    });
  });
});

describe('Successfully listing channels - channels/listall/v3', () => {
  test('Listing channels', () => {
    let res = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);

    res = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    const channelList2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);

    expect(channelList).toStrictEqual(channelList2);
    expect(channelList).toStrictEqual({
      channels: [{
        channelId: channelIdList[0],
        name: 'DOTA2'
      },
      {
        channelId: channelIdList[1],
        name: 'DOTA2'
      },
      {
        channelId: channelIdList[2],
        name: 'DOTA2'
      }]
    });
  });
});

describe('Successfully adding owners - channel/addowner/v2', () => {
  test('Testing successful addowner', () => {
    expect(addowner(registrationData[0].token, channelIdList[0], registrationData[1].authUserId).statusCode).toStrictEqual(OK);
    expect(addowner(registrationData[1].token, channelIdList[1], registrationData[2].authUserId).statusCode).toStrictEqual(OK);
  });
});

describe('Successfully removing owners - channel/removeowner/v2', () => {
  test('Testing for successful remove owner', () => {
    expect(removeOwner(registrationData[1].token, channelIdList[1], registrationData[2].authUserId).statusCode).toStrictEqual(OK);
  });

  test('Testing successful global owner removeowner', () => {
    expect(removeOwner(registrationData[0].token, channelIdList[0], registrationData[1].authUserId).statusCode).toStrictEqual(OK);
  });
});

describe('Successfully detailing channels - channel/details/v3', () => {
  test('User is owner', () => {
    const res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelIdList[0]
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'DOTA2',
      isPublic: true,
      ownerMembers: [{
        uId: registrationData[0].authUserId,
        email: 'mridul@gmail.com',
        nameFirst: 'Mridul',
        nameLast: 'Anand',
        handleStr: 'mridulanand'
      }],
      allMembers: [{
        uId: registrationData[0].authUserId,
        email: 'mridul@gmail.com',
        nameFirst: 'Mridul',
        nameLast: 'Anand',
        handleStr: 'mridulanand'
      }, {
        uId: registrationData[1].authUserId,
        email: 'anand@gmail.com',
        nameFirst: 'Anand',
        nameLast: 'Singh',
        handleStr: 'anandsingh'
      }],
    });
  });

  test('User is member', () => {
    const res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelIdList[0]
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    const data = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(data).toStrictEqual({
      name: 'DOTA2',
      isPublic: true,
      ownerMembers: [{
        uId: registrationData[0].authUserId,
        email: 'mridul@gmail.com',
        nameFirst: 'Mridul',
        nameLast: 'Anand',
        handleStr: 'mridulanand'
      }],
      allMembers: [{
        uId: registrationData[0].authUserId,
        email: 'mridul@gmail.com',
        nameFirst: 'Mridul',
        nameLast: 'Anand',
        handleStr: 'mridulanand'
      }, {
        uId: registrationData[1].authUserId,
        email: 'anand@gmail.com',
        nameFirst: 'Anand',
        nameLast: 'Singh',
        handleStr: 'anandsingh'
      }],
    });
  });
});

describe('Successfully inviting - channel/invite/v3', () => {
  test('Testing for successful invite - channel/invite/v2', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[0],
        uId: registrationData[2].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });
});

describe('Successfully listing messages channels - channel/messages/v3', () => {
  test('Testing for correct order of messages returned', () => {
    expect(channelMessages(registrationData[1].token, channelIdList[0], 0).statusCode).toStrictEqual(OK);
    for (let i = 0; i < 60; i++) {
      request('POST', `${url}:${port}/message/send/v2`, {
        json: {
          channelId: channelIdList[0],
          message: 'bye',
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[0].token,
        }
      });
    }
    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 40,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 40,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
  
    expect(channelMessages(registrationData[0].token, channelIdList[0], 0).statusCode).toStrictEqual(OK);
  });
});

describe('Successfully leaving channels - channel/leave/v2', () => {
  test('Testing for successful leave', () => {
    expect(channelLeave(registrationData[1].token, channelIdList[0]).statusCode).toStrictEqual(OK);
  });

  test('Last person is owner and leaves', () => {
    expect(channelLeave(registrationData[0].token, channelIdList[0]).statusCode).toStrictEqual(OK);
  });
});
