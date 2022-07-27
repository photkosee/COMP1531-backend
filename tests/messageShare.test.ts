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

describe('Testing success sharing message - message/share/v1', () => {
  test('Sharing message between dms and channels', () => {
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

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: ch1.channelId
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

    request('POST', `${url}:${port}/channel/join/v3`, {
      json: {
        channelId: ch2.channelId
      },
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: ch1.channelId,
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
        channelId: ch1.channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: ch2.channelId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms3 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm1.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms4 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm2.dmId,
        message: 'abc'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);
    const ms5 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dm1.dmId,
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
        ogMessageId: ms4.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms5.messageId,
        message: 'asdf',
        channelId: ch1.channelId,
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
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: ch1.channelId,
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
        ogMessageId: ms2.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm1.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms4.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm1.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms3.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dm2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: ms5.messageId,
        message: 'asdf',
        channelId: ch2.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(OK);
  });
});

describe('Testing for error - message/share/v1', () => {
  test('Invalid dmId and channelId', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const dmId = JSON.parse(res.body as string);

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
    const chId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const messageId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'asdf',
        channelId: -5,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: -5
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'asdf',
        channelId: chId.channelId,
        dmId: dmId.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid ogMessageId', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const dmId = JSON.parse(res.body as string);

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
    const chId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const messageId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: -5,
        message: 'asdf',
        channelId: chId.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: -5,
        message: 'asdf',
        channelId: -1,
        dmId: dmId.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });


  test('Invalid message length', () => {
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const bodyObj1 = JSON.parse(res.body as string);

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
    const chId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: bodyObj1.dmId,
        message: 'wwqer'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const messageId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'tYpl03WuT6YS2L4xmaGyg1beVNFIi73FvKG4BP04BzFv6EPWqRigRNUBtysEDLnccTPzyU2ptdv8a8cCCEospatVbVXryHKcVEF54xIV7c74uEfeGXLA156p1Ziil8JgZFt9o9JfWTRZr60pTq7vOvCxgqkYrGmExz2BpPmrFdx4AddiWlbPCOqaWxiwZdfq4n8JL3E0iiryNdLVFhPLLnH6fdzm9xhjo8gax9mEWrTShyxTEJIlL1eWWK2OtcEKKlqzsTdLQCJRlcFwf7tVDEca9jjb5Q9310dFZBBFNJkXPB6vkKz60NrVyFuLTbIUZWNbJ7Mrx9jH0OtYxkTZUyG2KTeCwsVyh8Rels2cYUxMGyd4ePw4BLqtzEJ2Fx0zIwzqHcJjxQZZAF61Pc7Vxn4AbS32yCoI239OIpg00A4XNDT7xJaayg5GD0h8PXb1dchNbYUsuDfIdb4NgE6NryDY5nBJE5NqbpQBW1euLFOxVVTU3zG5FKGbKUQX8k5KRgt1mQRruf57eKo8tQV0c3uUdVPu3Is1hyAQlkmJThxsR1raTuduVxqGWLrfbN5PPhMM45XP5XpDF0sye7MiP6WSqYm5Wh49nuT5wXw0zxeMc73CD7CQ7BbYiYZOAQHHmgDlKTG0wQjiGZv780MFThXYxsUDjIEa14k1vIB6FJtlthxtMI0nJFxcwH0d1jPcZ8dICJfS5xK3x5zjBGF8GeUMFqQhiUj1MywhpfauaVKJ8OvNMfj1ji712inncKcCmHfOzKPSTMRMPD3LaRVVF5TjLaP1NVHDiNKHMdVzJNkBGTrI5tR50VMkdDpFjx3wGxvKegXkQRFVf3xgMmsxlB4pYrzDJcGnhGrDKb9fuIalASD7uRXQ109imGCqHkLJZ8cbeCz4kZuZl3shZBSyuLX4ycjSWNwy1yTfGqWTfISBxe0CjfjKn4fdTreeLTSN742M7tH26lPrDesD8G59TTCA3ylWWyxhV6ubfbNJB',
        channelId: chId.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
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
    const validData: any = [
      { token: registrationData[0].token, uIds: [registrationData[1].authUserId, registrationData[2].authUserId] },
      { token: registrationData[1].token, uIds: [registrationData[0].authUserId, registrationData[2].authUserId] },
      { token: registrationData[2].token, uIds: [registrationData[0].authUserId] },
    ];

    let res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [...validData[1].uIds]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const dmId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/dm/create/v2`, {
      body: JSON.stringify({
        uIds: [registrationData[0].authUserId]
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    const dmId2 = JSON.parse(res.body as string);

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
    const chId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/senddm/v2`, {
      body: JSON.stringify({
        dmId: dmId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[0].token
      }
    });
    const messageId = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: chId.channelId,
        message: 'asdf'
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    const messageId2 = JSON.parse(res.body as string);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId.messageId,
        message: 'asdf',
        channelId: chId.channelId,
        dmId: -1
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[2].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);

    res = request('POST', `${url}:${port}/message/share/v1`, {
      body: JSON.stringify({
        ogMessageId: messageId2.messageId,
        message: 'asdf',
        channelId: -1,
        dmId: dmId2.dmId
      }),
      headers: {
        'Content-type': 'application/json',
        token: validData[1].token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
