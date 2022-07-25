import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing with invalid inputs - channels/listall/v3', () => {
  test('Invalid token', () => {
    const res3 = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRER1ZlREdWQUl6Q3cwWG9ZV05tUVZPTHprbkxZOWNKWWpvVmNJTlh4eEliS0E0SGhSOGJreSIsImlhdCI6MTY1ODU3NzcxNn0.--c5eWAvAW25kp8CnDNXRTl9iCAz4eDOrq5jq8JoHzc'
      }
    });
    expect(res3.statusCode).toBe(FORBIDDEN);
  });
});

describe('Successfully listing channels - channels/listall/v3', () => {
  test('Listing no channels', () => {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    const res3 = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channelList = JSON.parse(res3.getBody() as string);
    expect(res.statusCode).toBe(OK);
    expect(channelList).toStrictEqual({ channels: [] });
  });

  test('Listing channels', () => {
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
        nameFirst: '2',
        nameLast: '2',
      }
    });
    const user2 = JSON.parse(res.getBody() as string);
    const token2 = user2.token;

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel = JSON.parse(res.getBody() as string);

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'LoL',
        isPublic: true
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel2 = JSON.parse(res.getBody() as string);

    res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'HoN',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channel3 = JSON.parse(res.getBody() as string);

    res = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    const channelList = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);

    res = request('GET', `${url}:${port}/channels/listall/v3`, {
      headers: {
        'Content-type': 'application/json',
        token: token2
      }
    });
    const channelList2 = JSON.parse(res.getBody() as string);
    expect(res.statusCode).toBe(OK);

    expect(channelList).toStrictEqual(channelList2);
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
