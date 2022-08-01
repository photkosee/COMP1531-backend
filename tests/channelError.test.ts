import request from 'sync-request';
import config from '../src/config.json';

const BADREQUEST = 400;
const FORBIDDEN = 403;
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

  let res = request('GET', `${url}:${port}/channel/details/v3`, {
    json: {
      channelId: 1
    },
    headers: {
      'Content-type': 'application/json',
      token: registrationData[0].token,
    }
  });
  expect(res.statusCode).toBe(BADREQUEST);

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

  res = request('POST', `${url}:${port}/channels/create/v3`, {
    body: JSON.stringify({
      name: 'PRIVATE',
      isPublic: false
    }),
    headers: {
      'Content-type': 'application/json',
      token: registrationData[2].token
    }
  });
  const bodyObj = JSON.parse(res.body as string);
  channelIdList.push(bodyObj.channelId);

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

describe('Error cases - channel/addowner/v2', () => {
  test('Testing for invalid channelId', () => {
    expect(addowner(registrationData[0].token, 0.1, registrationData[1].authUserId).statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing for invalid uId and token', () => {
    expect(addowner('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0', channelIdList[0], registrationData[1].authUserId).statusCode).toStrictEqual(FORBIDDEN);
    expect(addowner(registrationData[0].token, channelIdList[0], 0.1).statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing for token not in channel and uId already owner', () => {
    expect(addowner(registrationData[0].token, channelIdList[3], registrationData[1].authUserId).statusCode).toStrictEqual(BADREQUEST);
    expect(addowner(registrationData[0].token, channelIdList[0], registrationData[0].authUserId).statusCode).toStrictEqual(BADREQUEST);
    expect(addowner(registrationData[1].token, channelIdList[0], registrationData[0].authUserId).statusCode).toStrictEqual(BADREQUEST);
    expect(addowner(registrationData[2].token, channelIdList[0], registrationData[0].authUserId).statusCode).toStrictEqual(FORBIDDEN);
  });
});

describe('Error cases - channel/details/v3', () => {
  test('Invalid/non-existent token', () => {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRGRmRGLkN0aW5Oai8yR0hJdklpaUNPbXpWekhmdXF6aGF1VlV6U1NHa1VuUW5Zci9iUlFCcSIsImlhdCI6MTY1ODU3NzY2Mn0.A4f61mkebUTex1U50rp7z6hT-vfjmlMtcsmBpVUICHQ';
    const res = request('GET', `${url}:${port}/channel/details/v3`, {
      json: {
        channelId: channelIdList[0]
      },
      headers: {
        'Content-type': 'application/json',
        token: dummyToken,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid/non-existent channelId', () => {
    const res = request('GET', `${url}:${port}/channel/details/v3`, {
      json: {
        channelId: -10
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('User is not a member', () => {
    const res = request('GET', `${url}:${port}/channel/details/v3`, {
      qs: {
        channelId: channelIdList[0]
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token,
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Error cases - channel/invite/v2', () => {
  test('Testing for cases where user already in channel', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[0],
        uId: registrationData[1].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing with valid channelId and invalid uId', () => {
    let res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[0],
        uId: 0.1,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(BADREQUEST);

    res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[0],
        uId: registrationData[1].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRGRmRGLkN0aW5Oai8yR0hJdklpaUNPbXpWekhmdXF6aGF1VlV6U1NHa1VuUW5Zci9iUlFCcSIsImlhdCI6MTY1ODU3NzY2Mn0.A4f61mkebUTex1U50rp7z6hT-vfjmlMtcsmBpVUICHQ'
      }
    });
    expect(res.statusCode).toStrictEqual(FORBIDDEN);
  });

  test('Testing for invalid channel', () => {
    const res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: 0.1,
        uId: registrationData[1].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing for token and uId are same person', () => {
    let res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[0],
        uId: registrationData[0].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    expect(res.statusCode).toStrictEqual(BADREQUEST);

    res = request('POST', `${url}:${port}/channel/invite/v3`, {
      json: {
        channelId: channelIdList[2],
        uId: registrationData[0].authUserId,
      },
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });
    expect(res.statusCode).toStrictEqual(FORBIDDEN);
  });
});

describe('Error cases - channel/join/v2', () => {
  test('Invalid/non-existent token', () => {
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRqMkdrY3FJUFEvZ3hiRjRzbUYvck1lcndPUU13VHJYSnIwRy5hRnRxcURUVkppWTdpZFhLbSIsImlhdCI6MTY1ODU3NzYzNH0.yH6ATBlI46lkfxdojeOFi0ZdDfZMDeV6GoXcDNQjL9Y';
    const res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelIdList[0]
        },
        headers: {
          'Content-type': 'application/json',
          token: dummyToken,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid/non-existent channelId', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: -10
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[0].token,
        }
      }
    );
    expect(res.statusCode).toStrictEqual(BADREQUEST);
  });

  test('User is already a member', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelIdList[0]
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[0].token,
        }
      }
    );
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Adding a non-global owner to a private channel', () => {
    const res = request(
      'POST', `${url}:${port}/channel/join/v3`, {
        json: {
          channelId: channelIdList[3]
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[1].token,
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Error cases - channel/leave/v2', () => {
  test('Testing for invalid input in channel/leave/v2', () => {
    expect(channelLeave(registrationData[0].token, 0.1).statusCode).toStrictEqual(BADREQUEST);
    expect(channelLeave('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRESTU4YWh0VnZ2eTRHVzA4MEF5VkxPZDloaHExL3N5OEJxc0NUMjdGQ3JMeXlRR1dLRFRUeSIsImlhdCI6MTY1ODU3NzY3NH0.tHBgizmzQXo1EKTdXoaCkt8DLu8XNFkYVZ8ycLlOLv0', channelIdList[0]).statusCode).toStrictEqual(FORBIDDEN);
  });

  test('Testing for user not in channel', () => {
    expect(channelLeave(registrationData[0].token, channelIdList[2]).statusCode).toStrictEqual(FORBIDDEN);
  });
});

describe('Error cases - channel/removeowner/v2', () => {
  test('Testing for invalid channelId', () => {
    expect(removeOwner(registrationData[0].token, 0.1, registrationData[2].authUserId).statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing for invalid uId and token', () => {
    expect(removeOwner(registrationData[0].token, channelIdList[0], 0.1).statusCode).toStrictEqual(BADREQUEST);
    expect(removeOwner('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRGRmRGLkN0aW5Oai8yR0hJdklpaUNPbXpWekhmdXF6aGF1VlV6U1NHa1VuUW5Zci9iUlFCcSIsImlhdCI6MTY1ODU3NzY2Mn0.A4f61mkebUTex1U50rp7z6hT-vfjmlMtcsmBpVUICHQ', channelIdList[0], registeredUser[1].authUserId).statusCode).toStrictEqual(FORBIDDEN);
  });

  test('Testing for token not in channel and uId not owner', () => {
    expect(removeOwner(registrationData[0].token, channelIdList[0], registrationData[2].authUserId).statusCode).toStrictEqual(BADREQUEST);
    expect(removeOwner(registrationData[1].token, channelIdList[0], registrationData[0].authUserId).statusCode).toStrictEqual(FORBIDDEN);
    expect(removeOwner(registrationData[0].token, channelIdList[0], registrationData[1].authUserId).statusCode).toStrictEqual(BADREQUEST);
  });

  test('Testing for remove last person and remove yourself', () => {
    expect(removeOwner(registrationData[0].token, channelIdList[0], registeredUser[0].authUserId).statusCode).toStrictEqual(BADREQUEST);
    expect(removeOwner(registrationData[1].token, channelIdList[1], registeredUser[1].authUserId).statusCode).toStrictEqual(BADREQUEST);
  });
});
