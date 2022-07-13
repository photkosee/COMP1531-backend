import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };

afterAll(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

describe('Testing for empty field values - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: '',
      password: '',
      nameFirst: '',
      nameLast: '',
      expected: ERROR,
    },
    {
      email: '    ',
      password: '    ',
      nameFirst: '    ',
      nameLast: '    ',
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Testing with wrong typeof parameter - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 7647687586758668,
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: ERROR,
    },
    {
      email: 'mridul@gmail.com',
      password: 8397563465,
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: ERROR,
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 873247786,
      nameLast: 'Singh',
      expected: ERROR,
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 'Mridul',
      nameLast: 8732457665,
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Testing for password length - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'Mas@1',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: ERROR,
    },
    {
      email: 'mriduls@gmail.com',
      password: '',
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: ERROR,
    },
    {
      email: 'mridul907@gmail.com',
      password: '4#Assd',
      nameFirst: 'Mridul',
      nameLast: 'Rathore',
      expected: { token: expect.any(String), authUserId: 1 },
    },
    {
      email: 'mriduerl907@gmail.com',
      password: 'd',
      nameFirst: 'dfvsdfv',
      nameLast: 'Ratdsfvhore',
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Testing for same user email - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: { token: expect.any(String), authUserId: 1 },
    },
    {
      email: 'mridul@gmail.com',
      password: 'ebrvj64#sdc%',
      nameFirst: 'Mridul',
      nameLast: 'Singh',
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Testing for wrong email format - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: '@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mreridul',
      nameLast: 'Anafnd',
      expected: ERROR,
    },
    {
      email: 'jhon-@gmail.com',
      password: 'ebrvetgj64#sdc%',
      nameFirst: 'Mrivfdul',
      nameLast: 'fvSingh',
      expected: ERROR,
    },
    {
      email: 'ali..saund@mail.com',
      password: 'uhuvbnr567T#$%',
      nameFirst: 'dbMrcidul',
      nameLast: 'Ancvand',
      expected: ERROR,
    },
    {
      email: 'den_ode@unsw#mail.com',
      password: 'eyt5hvj64#cvsfsdc%',
      nameFirst: 'Mdvridul',
      nameLast: 'Sdfbingh',
      expected: ERROR,
    },
    {
      email: 'donald tram@gmail.com',
      password: 'uhunr5gf67T#$%',
      nameFirst: 'Mfvridul',
      nameLast: 'Anasfvnd',
      expected: ERROR,
    },
    {
      email: 'arther@mail..com',
      password: 'ebrvjdfb64#sdc%',
      nameFirst: 'Mrsfvidul',
      nameLast: 'Sindgbgh',
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Testing for valid name limit - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'artherkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush',
      nameLast: 'Anand',
      expected: ERROR,
    },
    {
      email: 'mrid34uls@gmail.com',
      password: 'uhunfgr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'zafrirkjaefgbaisodbhasukdbgoibuoifgboiasbsivgbasush',
      expected: ERROR,
    },
    {
      email: 'mridu34l907@gmail.com',
      password: 'uhunrgf567T#$%',
      nameFirst: '  ',
      nameLast: 'Rathore',
      expected: ERROR,
    },
    {
      email: 'mridef34uls@gmail.com',
      password: 'uhunsfr567T#$%',
      nameFirst: 'Mridul',
      nameLast: '  ',
      expected: ERROR,
    },
    {
      email: 'mriduwe34l907@gmail.com',
      password: 'uhunrwd567T#$%',
      nameFirst: '   ',
      nameLast: '   ',
      expected: ERROR,
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});

describe('Tests for successful registration - auth/register/v2', () => {
  beforeAll(() => {
    request('DELETE', `${url}:${port}/clear/v1`);
  });

  test.each([
    {
      email: 'mridul@gmail.com',
      password: 'uhunr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: { token: expect.any(String), authUserId: 1 },
    },
    {
      email: 'mriduls@gmail.com',
      password: 'uhunr56ef7T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: { token: expect.any(String), authUserId: 2 },
    },
    {
      email: 'mridul907@gmail.com',
      password: 'uhudfnr567T#$%',
      nameFirst: 'Mridul',
      nameLast: 'Anand',
      expected: { token: expect.any(String), authUserId: 3 },
    },
  ])(
    '($email, $password, $nameFirst, $nameLast) => $expected',
    ({ email, password, nameFirst, nameLast, expected }) => {
      const res = request('POST', `${url}:${port}/auth/register/v2`, {
        body: JSON.stringify({
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }),
        headers: {
          'Content-type': 'application/json',
        },
      });
      const bodyObj = JSON.parse(res.body as string);
      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(expected);
    }
  );
});
