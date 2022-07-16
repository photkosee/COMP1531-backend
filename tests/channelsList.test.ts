import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with unexisting token - channels/list/v2', () => {
  test('Invalid inputs', () => {
    let res = request('POST', `${url}:${port}/auth/register/v2`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('GET', `${url}:${port}/channels/list/v2`, {
      qs: {
        token: -678
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelList).toStrictEqual(ERROR);
  });
});

describe('Testing listing no channels - channels/list/v2', () => {
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
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    res = request('GET', `${url}:${port}/channels/list/v2`, {
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelList).toStrictEqual({ channels: [] });
  });
});

describe('Testing listing channels - channels/list/v2', () => {
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
    expect(res.statusCode).toBe(OK);
    const token = user.token;

    const res2 = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'DOTA2',
        isPublic: false
      }
    });
    expect(res2.statusCode).toBe(OK);

    res = request('POST', `${url}:${port}/channels/create/v2`, {
      json: {
        token: token,
        name: 'LoL',
        isPublic: true
      }
    });
    expect(res.statusCode).toBe(OK);

    res = request('GET', `${url}:${port}/channels/list/v2`, {
      qs: {
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelList).toStrictEqual({
      channels: [{
        channelId: 1,
        name: 'DOTA2'
      },
      {
        channelId: 2,
        name: 'LoL'
      }]
    });
  });
});
