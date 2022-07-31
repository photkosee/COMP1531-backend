import request from 'sync-request';
import config from '../src/config.json';

const BADREQUEST = 400;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing for error - message/send/v2', () => {
  test('Invalid message length', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
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
        message: ''
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });

  test('Invalid channelId', () => {
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
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
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
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
    let res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal1@email.com',
        password: '1234567',
        nameFirst: 'One',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
      }
    });
    const user = JSON.parse(res.getBody() as string);
    const token = user.token;

    res = request('POST', `${url}:${port}/auth/register/v3`, {
      body: JSON.stringify({
        email: 'mal2@email.com',
        password: '1234567',
        nameFirst: 'One2',
        nameLast: 'Number',
      }),
      headers: {
        'Content-type': 'application/json',
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
        token: token2
      }
    });

    res = request('POST', `${url}:${port}/message/send/v2`, {
      body: JSON.stringify({
        channelId: 1,
        message: 'sdfgsdg'
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });
});
