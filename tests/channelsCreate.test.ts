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

describe('Testing with invalid inputs - channels/create/v3', () => {
  test('Invalid token', () => {
    const res = request('POST', `${url}:${port}/channels/create/v3`, {
      body: JSON.stringify({
        name: 'DOTA2',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRER1ZlREdWQUl6Q3cwWG9ZV05tUVZPTHprbkxZOWNKWWpvVmNJTlh4eEliS0E0SGhSOGJreSIsImlhdCI6MTY1ODU3NzcxNn0.--c5eWAvAW25kp8CnDNXRTl9iCAz4eDOrq5jq8JoHzc'
      }
    });
    expect(res.statusCode).toBe(FORBIDDEN);
  });

  test('Invalid name length', () => {
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
        name: '',
        isPublic: false
      }),
      headers: {
        'Content-type': 'application/json',
        token: token
      }
    });
    expect(res.statusCode).toBe(BADREQUEST);
  });
});
