import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const port = config.port;
const url = config.url;

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing for empty field values - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: '    ',
      password: '    ',
      nameFirst: '    ',
      nameLast: '    ',
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Testing with wrong typeof parameter - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 7647687586758668,
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: BADREQUEST,
    },
    {
      email: 'mridul@gmail.com',
      password: 8397563465,
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: BADREQUEST,
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 873247786,
      nameLast: 'Singh',
      expected: BADREQUEST,
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 'Mridul',
      nameLast: 8732457665,
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        },
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Testing for password length - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'Mas@1',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: BADREQUEST,
    },
    {
      email: 'mriduls@gmail.com',
      password: '',
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Testing for same user email - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: OK,
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Testing for wrong email format - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: '@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mreridul',
      nameLast: 'Anafnd',
      expected: BADREQUEST,
    },
    {
      email: 'jhon-@gmail..com',
      password: 'ebrvetgj64#sdc%',
      nameFirst: 'Mrivfdul',
      nameLast: 'fvSingh',
      expected: BADREQUEST,
    },
    {
      email: 'donald tram@gmail.com',
      password: 'uhunr5gf67T#$%',
      nameFirst: 'Mfvridul',
      nameLast: 'Anasfvnd',
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Testing for valid name limit - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'artherkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush',
      nameLast: 'Anand',
      expected: BADREQUEST,
    },
    {
      email: 'mrid34uls@gmail.com',
      password: 'uhunfgr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'zafrirkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush',
      expected: BADREQUEST,
    },
    {
      email: 'mridu34l907@gmail.com',
      password: 'uhunrgf567T#$%',
      nameFirst: '  ',
      nameLast: 'Rathore',
      expected: BADREQUEST,
    },
    {
      email: 'mridef34uls@gmail.com',
      password: 'uhunsfr567T#$%',
      nameFirst: 'Mridul',
      nameLast: '  ',
      expected: BADREQUEST,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});

describe('Tests for successful registration - auth/register/v3', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: OK,
    }
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v3`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        }
      });
      expect(res.statusCode).toBe(expected);
    }
  );
});
