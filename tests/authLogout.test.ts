import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const FORBIDDEN = 403;
const port = config.port;
const url = config.url;

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mjghridul', nameLast: 'Anand' },
  { email: 'mrihhduls@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Mridul', nameLast: 'Singh' }
];

beforeAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
  registrationData = [];
  for (const user of registeredUser) {
    const res = request('POST', `${url}:${port}/auth/register/v3`, {
      json: {
        email: user.email,
        password: user.password,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast
      }
    });
    const bodyObj = JSON.parse(res.body as string);
    registrationData.push({ token: bodyObj.token, authUserId: bodyObj.authUserId });
  }
});

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

test('Tests for successful logout - auth/logout/v2', () => {
  for (let i = 0; i < registeredUser.length; i++) {
    const res = request('POST', `${url}:${port}/auth/logout/v2`, {
      headers: {
        'Content-type': 'application/json',
        token: registrationData[i].token
      }
    });
    expect(res.statusCode).toBe(OK);
  }
});

describe('Testing with invalid token passed - auth/logout/v2', () => {
  test.each([
    {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCQ4YVJvSTRaNE1obXhwcnFEMjhGa2gucS5GN1cwc09DR3VXaEFLeHd6blhnc09uaWVra0hPRyIsImlhdCI6MTY1ODU3MTc0OH0.7IbUs7eTClwpVxMdQ-8XKsDiGNNbrXhhH0ZSbB_YI5M',
      expected: FORBIDDEN,
    },
    {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRxN2tmSjV0MnUzSktYMGZDNGtqUlEubS51OVUycmxJSC9tLnZHTERTZEMwUHFYSVc4ZlQ5aSIsImlhdCI6MTY1ODU3MTc5Mn0.Zu15e4_mPiVXp6mEIqO9I4NYquLJ-TFGy_a9oheXmsY',
      expected: FORBIDDEN,
    },
    {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no',
      expected: FORBIDDEN,
    },
  ])(
    '($token) => $expected',
    ({ token, expected }) => {
      const res = request('POST', `${url}:${port}/auth/logout/v2`, {
        headers: {
          'Content-type': 'application/json',
          token: token
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});
