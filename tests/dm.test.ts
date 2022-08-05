import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];
let dmIdList: any = [];

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
    { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
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
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Test Cases for HTTP Route: dm/create/v2', () => {
  test('Test for any uId in uIds does not refer to a valid user - dm/create/v2', () => {
    const invalidUidData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, -1] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, -1] },
    ];

    for (let i = 0; i < invalidUidData.length; i++) {
      const res = request('POST', `${url}:${port}/dm/create/v2`, {
        body: JSON.stringify({
          uIds: [...invalidUidData[i].uIds]
        }),
        headers: {
          'Content-type': 'application/json',
          token: invalidUidData[i].token
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for duplicate uId in uIds - dm/create/v2', () => {
    const duplicateUidData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[2].authUserId] },
    ];

    for (let i = 0; i < duplicateUidData.length; i++) {
      const res = request('POST', `${url}:${port}/dm/create/v2`, {
        body: JSON.stringify({
          uIds: [...duplicateUidData[i].uIds]
        }),
        headers: {
          'Content-type': 'application/json',
          token: duplicateUidData[i].token
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for creator In Uids Data - dm/create/v2', () => {
    const creatorInUidData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[2].authUserId, registrationData[0].authUserId, registrationData[1].authUserId] },
    ];

    for (let i = 0; i < creatorInUidData.length; i++) {
      const res = request('POST', `${url}:${port}/dm/create/v2`, {
        body: JSON.stringify({
          uIds: [...creatorInUidData[i].uIds]
        }),
        headers: {
          'Content-type': 'application/json',
          token: creatorInUidData[i].token
        }
      });
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for invalid Token Data - dm/create/v2', () => {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[0].authUserId, registrationData[2].authUserId, registrationData[1].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ4YVJvSTRaNE1obXhwcnFEMjhGa2gucS5GN1cwc09DR3VXaEFLeHd6blhnc09uaWVra0hPRyIsImlhdCI6MTY1ODU3MTc0OH0.7IbUs7eTClwpVxMdQ-8XKsDiGNNbrXhhH0ZSbB_YI5M'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Test Cases for HTTP Route: dm/list/v2', () => {
  test('Test for success dm list fetch - dm/list/v2', () => {
    const validData = [
      { token: registrationData[0].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] },
      { token: registrationData[1].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] },
      { token: registrationData[2].token, expected: [{ dmId: dmIdList[0], name: 'anandsingh, mridulanand, mridulrathor' }, { dmId: dmIdList[1], name: 'anandsingh, mridulanand, mridulrathor' }] }
    ];

    for (let i = 0; i < validData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/list/v2`,
        {
          headers: {
            'Content-type': 'application/json',
            token: validData[i].token
          }
        }
      );
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj.dms).toStrictEqual(validData[i].expected);
    }
  });

  test('Test for invalid Token Data - dm/list/v2', () => {
    const res = request(
      'GET', `${url}:${port}/dm/list/v2`,
      {
        headers: {
          'Content-type': 'application/json',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Test Cases for HTTP Route: dm/details/v2', () => {
  test('Test for successful dm details fetched - dm/details/v2', () => {
    const validData: any = [
      {
        token: registrationData[0].token,
        dmId: dmIdList[0],
        expected: {
          name: 'anandsingh, mridulanand, mridulrathor',
          members: [
            {
              uId: 1,
              email: 'mridul@gmail.com',
              nameFirst: 'Mridul',
              nameLast: 'Anand',
              handleStr: 'mridulanand',
            },
            {
              uId: 2,
              email: 'anand@gmail.com',
              nameFirst: 'Anand',
              nameLast: 'Singh',
              handleStr: 'anandsingh',
            },
            {
              uId: 3,
              email: 'rathor@gmail.com',
              nameFirst: 'Mridul',
              nameLast: 'Rathor',
              handleStr: 'mridulrathor',
            }
          ]
        }
      },
      {
        token: registrationData[1].token,
        dmId: dmIdList[1],
        expected: {
          name: 'anandsingh, mridulanand, mridulrathor',
          members: [
            {
              uId: 1,
              email: 'mridul@gmail.com',
              nameFirst: 'Mridul',
              nameLast: 'Anand',
              handleStr: 'mridulanand',
            },
            {
              uId: 2,
              email: 'anand@gmail.com',
              nameFirst: 'Anand',
              nameLast: 'Singh',
              handleStr: 'anandsingh',
            },
            {
              uId: 3,
              email: 'rathor@gmail.com',
              nameFirst: 'Mridul',
              nameLast: 'Rathor',
              handleStr: 'mridulrathor',
            }
          ]
        }
      }
    ];

    for (let i = 0; i < validData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/details/v2`,
        {
          qs: {
            dmId: validData[i].dmId
          },
          headers: {
            'Content-type': 'application/json',
            token: validData[i].token
          }
        }
      );
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(validData[i].expected);
    }
  });

  test('Test for invalid dmId - dm/details/v2', () => {
    const invalidDmIdData = [
      { token: registrationData[0].token, dmId: 3876 },
      { token: registrationData[2].token, dmId: '' }
    ];

    for (let i = 0; i < invalidDmIdData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/details/v2`,
        {
          qs: {
            dmId: invalidDmIdData[i].dmId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidDmIdData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for user is not a member of the DM - dm/details/v2', () => {
    const invalidMemberData = [
      { token: registrationData[3].token, dmId: dmIdList[0] },
      { token: registrationData[3].token, dmId: dmIdList[1] }
    ];

    for (let i = 0; i < invalidMemberData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/details/v2`,
        {
          qs: {
            dmId: invalidMemberData[i].dmId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidMemberData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Test for invalid Token Data - dm/details/v2', () => {
    const res = request(
      'GET', `${url}:${port}/dm/details/v2`,
      {
        qs: {
          dmId: dmIdList[1]
        },
        headers: {
          'Content-type': 'application/json',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRxN2tmSjV0MnUzSktYMGZDNGtqUlEubS51OVUycmxJSC9tLnZHTERTZEMwUHFYSVc4ZlQ5aSIsImlhdCI6MTY1ODU3MTc5Mn0.Zu15e4_mPiVXp6mEIqO9I4NYquLJ-TFGy_a9oheXmsY'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Test Cases for HTTP Route: dm/messages/v2', () => {
  test('Test for invalid dmId - dm/messages/v2', () => {
    const invalidDmIdData = [
      { token: registrationData[0].token, dmId: 3876, start: 0 },
      { token: registrationData[2].token, dmId: '', start: 0 }
    ];

    for (let i = 0; i < invalidDmIdData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/messages/v2`,
        {
          qs: {
            dmId: invalidDmIdData[i].dmId,
            start: invalidDmIdData[i].start
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidDmIdData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for invalid start parameter - dm/messages/v2', () => {
    const invalidStartData = [
      { token: registrationData[0].token, dmId: dmIdList[0], start: -1 },
      { token: registrationData[2].token, dmId: dmIdList[1], start: 10000 }
    ];

    for (let i = 0; i < invalidStartData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/messages/v2`,
        {
          qs: {
            dmId: invalidStartData[i].dmId,
            start: invalidStartData[i].start
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidStartData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for user is not a member of the DM - dm/messages/v2', () => {
    const invalidMemberData = [
      { token: registrationData[3].token, dmId: dmIdList[0], start: 0 },
      { token: registrationData[3].token, dmId: dmIdList[1], start: 0 }
    ];

    for (let i = 0; i < invalidMemberData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/messages/v2`,
        {
          qs: {
            dmId: invalidMemberData[i].dmId,
            start: invalidMemberData[i].start
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidMemberData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Test for invalid Token Data - dm/messages/v2', () => {
    const res = request(
      'GET', `${url}:${port}/dm/messages/v2`,
      {
        qs: {
          dmId: 1,
          start: 0
        },
        headers: {
          'Content-type': 'application/json',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRxN2tmSjV0MnUzSktYMGZDNGtqUlEubS51OVUycmxJSC9tLnZHTERTZEMwUHFYSVc4ZlQ5aSIsImlhdCI6MTY1ODU3MTc5Mn0.Zu15e4_mPiVXp6mEIqO9I4NYquLJ-TFGy_a9oheXmsY'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Test for correct functionality - dm/messages/v2', () => {
    const validData = [
      { token: registrationData[0].token, dmId: dmIdList[0], start: 0 },
      { token: registrationData[1].token, dmId: dmIdList[1], start: 0 }
    ];

    for (let i = 0; i < validData.length; i++) {
      const res = request(
        'GET', `${url}:${port}/dm/messages/v2`,
        {
          qs: {
            dmId: validData[i].dmId,
            start: validData[i].start
          },
          headers: {
            'Content-type': 'application/json',
            token: validData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(OK);
    }
  });

  test('Test for succes messages return- dm/messages/v2', () => {
    const res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[1].authUserId, registrationData[2].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token
      }
    });
    const dmId = JSON.parse(res.body as string).dmId;

    for (let i = 0; i < 60; i++) {
      request('POST', `${url}:${port}/message/senddm/v2`, {
        body: JSON.stringify({
          dmId: dmId,
          message: `${Math.floor(Math.random() * Date.now())}`
        }),
        headers: {
          'Content-type': 'application/json',
          token: registrationData[1].token
        }
      });
    }

    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 25,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token
      }
    });

    request('POST', `${url}:${port}/message/react/v1`, {
      body: JSON.stringify({
        messageId: 25,
        reactId: 1
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[2].token
      }
    });

    const response = request(
      'GET', `${url}:${port}/dm/messages/v2`,
      {
        qs: {
          dmId: dmId,
          start: 0
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[2].token
        }
      }
    );
    const resData = JSON.parse(response.body as string);
    expect(response.statusCode).toBe(OK);
    expect(resData.start).toBe(0);
    expect(resData.end).toBe(50);
    expect(resData.messages.length).toBe(50);
  });
});

describe('Test Cases for HTTP Route: dm/leave/v2', () => {
  test('Test for successful dm leave - dm/leave/v2', () => {
    const validData = [
      { token: registrationData[0].token, dmId: dmIdList[0] },
      { token: registrationData[1].token, dmId: dmIdList[1] }
    ];

    for (let i = 0; i < validData.length; i++) {
      const res = request(
        'POST', `${url}:${port}/dm/leave/v2`,
        {
          body: JSON.stringify({
            dmId: validData[i].dmId
          }),
          headers: {
            'Content-type': 'application/json',
            token: validData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(OK);
    }
  });

  test('Test for invalid dmId - dm/leave/v2', () => {
    const invalidDmIdData = [
      { token: registrationData[0].token, dmId: 3876 },
      { token: registrationData[2].token, dmId: '' }
    ];

    for (let i = 0; i < invalidDmIdData.length; i++) {
      const res = request(
        'POST', `${url}:${port}/dm/leave/v2`,
        {
          body: JSON.stringify({
            dmId: invalidDmIdData[i].dmId
          }),
          headers: {
            'Content-type': 'application/json',
            token: invalidDmIdData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for user is not a member of the DM - dm/leave/v2', () => {
    const invalidMemberData = [
      { token: registrationData[3].token, dmId: dmIdList[0] },
      { token: registrationData[3].token, dmId: dmIdList[1] }
    ];

    for (let i = 0; i < invalidMemberData.length; i++) {
      const res = request(
        'POST', `${url}:${port}/dm/leave/v2`,
        {
          body: JSON.stringify({
            dmId: invalidMemberData[i].dmId
          }),
          headers: {
            'Content-type': 'application/json',
            token: invalidMemberData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Test for invalid Token Data - dm/leave/v2', () => {
    const res = request(
      'POST', `${url}:${port}/dm/leave/v2`,
      {
        body: JSON.stringify({
          dmId: dmIdList[0]
        }),
        headers: {
          'Content-type': 'application/json',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});

describe('Test Cases for HTTP Route: dm/remove/v2', () => {
  test('Test for success dm remove - dm/remove/v2', () => {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: dmIdList[1]
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[2].token
        }
      }
    );
    expect(res.statusCode).toBe(OK);
  });

  test('Test for invalid dmId - dm/remove/v2', () => {
    const invalidDmIdData = [
      { token: registrationData[0].token, dmId: 8793 },
      { token: registrationData[2].token, dmId: '' }
    ];

    for (let i = 0; i < invalidDmIdData.length; i++) {
      const res = request(
        'DELETE', `${url}:${port}/dm/remove/v2`,
        {
          qs: {
            dmId: invalidDmIdData[i].dmId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidDmIdData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(BADREQUEST);
    }
  });

  test('Test for authorised user is no more in the DM - dm/remove/v2', () => {
    const invalidAuthUserIdData = [
      { token: registrationData[0].token, dmId: dmIdList[0] },
      { token: registrationData[1].token, dmId: dmIdList[0] }
    ];

    for (let i = 0; i < invalidAuthUserIdData.length; i++) {
      const res = request(
        'DELETE', `${url}:${port}/dm/remove/v2`,
        {
          qs: {
            dmId: invalidAuthUserIdData[i].dmId
          },
          headers: {
            'Content-type': 'application/json',
            token: invalidAuthUserIdData[i].token
          }
        }
      );
      expect(res.statusCode).toBe(FORBIDDEN);
    }
  });

  test('Test for invalid Token Data - dm/remove/v2', () => {
    const res = request(
      'DELETE', `${url}:${port}/dm/remove/v2`,
      {
        qs: {
          dmId: dmIdList[0]
        },
        headers: {
          'Content-type': 'application/json',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ4YVJvSTRaNE1obXhwcnFEMjhGa2gucS5GN1cwc09DR3VXaEFLeHd6blhnc09uaWVra0hPRyIsImlhdCI6MTY1ODU3MTc0OH0.7IbUs7eTClwpVxMdQ-8XKsDiGNNbrXhhH0ZSbB_YI5M'
        }
      }
    );
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
