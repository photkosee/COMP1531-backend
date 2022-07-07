import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with unexisting token - channels/listall/v2', () => {
  test('Invalid inputs', () => {
    const res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
    const token = user.token;

    request('POST', `${url}:${port}/channels/create/v2`, {
=======
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    const res2 = request('POST', `${url}:${port}/channels/create/v2`, {
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
<<<<<<< HEAD
=======
    expect(res2.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7

    const res3 = request('GET', `${url}:${port}/channels/listall/v2`, {
      qs: {
        token: 12345
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelList).toStrictEqual(ERROR);
  });
});

describe('Testing listing no channels - channels/listall/v2', () => {
  test('Valid inputs', () => {
    const res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
    const token = user.token;

    const res3 = request('GET', `${url}:${port}/channels/listall/v2`, {
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
<<<<<<< HEAD
    expect(res3.statusCode).toBe(OK);
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
    expect(channelList).toStrictEqual({ channels: [] });
  });
});

describe('Testing listing channels - channels/listall/v2', () => {
  test('Valid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: '2',
        nameLast: '2',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    const channel = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'LoL',
        isPublic: true
      }
    });
    const channel2 = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'HoN',
        isPublic: true
      }
    });
    const channel3 = JSON.parse(res.getBody() as string);
<<<<<<< HEAD
=======
    expect(res.statusCode).toBe(OK);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7

    res = request('GET', `${url}:${port}/channels/listall/v2`, {
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);

    res = request('GET', `${url}:${port}/channels/listall/v2`, {
      qs: {
        token: token2
      }
    });
    const channelList2 = JSON.parse(res.getBody() as string);
<<<<<<< HEAD

    expect(channelList).toStrictEqual(channelList2);
    expect(res.statusCode).toBe(OK);
=======
    expect(res.statusCode).toBe(OK);

    expect(channelList).toStrictEqual(channelList2);
>>>>>>> a9f5e853f3a6355a83a9e6e5820262a839db25d7
    expect(channelList).toStrictEqual({
      channels: [{
        channelId: channel.channelId,
        name: 'DOTA2'
      },
      {
        channelId: channel2.channelId,
        name: 'LoL'
      },
      {
        channelId: channel3.channelId,
        name: 'HoN'
      }]
    });
  });
});
