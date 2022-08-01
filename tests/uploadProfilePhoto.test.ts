import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const BADREQUEST = 400;
const FORBIDDEN = 403;
const deployedUrl = config.deployedUrl;
const port = config.port;
const url = config.url;

let registrationData: any = [];

const registeredUser: any = [
  { email: 'mridul@gmail.com', password: 'uhunr567T#$%', nameFirst: 'Mridul', nameLast: 'Anand' },
  { email: 'anand@gmail.com', password: 'uhunr56ef7T#$%', nameFirst: 'Anand', nameLast: 'Singh' }
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

describe('Test Cases for HTTP Route: user/profile/uploadphoto/v1', () => {
  test('Test for successful user profile photo upload', () => {
    const successRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: 0,
        xEnd: 500,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[0].token,
      }
    });
    expect(successRes.statusCode).toBe(OK);

    const profileData = request(
      'GET', `${url}:${port}/user/profile/v3`, {
        qs: {
          uId: registrationData[0].authUserId,
        },
        headers: {
          'Content-type': 'application/json',
          token: registrationData[0].token
        }
      }
    );
    const profileImgUrl = JSON.parse(profileData.getBody() as string).user.profileImgUrl;
    expect(profileImgUrl).toEqual(expect.not.stringMatching(`${deployedUrl}/static/profile.jpg`));
    expect(profileImgUrl).toStrictEqual(expect.any(String));
  });

  test('Test for imgUrl returns an HTTP status other than 200', () => {
    const errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-29d45635f09',
        xStart: 0,
        yStart: 0,
        xEnd: 500,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for other errors occur when attempting to retrieve the image', () => {
    const errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://google.comm',
        xStart: 0,
        yStart: 0,
        xEnd: 500,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for image uploaded is not a JPG', () => {
    const errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'https://filesamples.com/samples/image/png/sample_640%C3%97426.png',
        xStart: 0,
        yStart: 0,
        xEnd: 100,
        yEnd: 100,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for xEnd is less than or equal to xStart or yEnd is less than or equal to yStart', () => {
    let errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 100,
        yStart: 0,
        xEnd: 50,
        yEnd: 100,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 100,
        yStart: 100,
        xEnd: 500,
        yEnd: 50,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 100,
        yStart: 0,
        xEnd: 100,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: 100,
        xEnd: 500,
        yEnd: 100,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL', () => {
    let errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: -1,
        yStart: 0,
        xEnd: 50,
        yEnd: 100,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: -1,
        xEnd: 500,
        yEnd: 50,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 500,
        yStart: 500,
        xEnd: -1,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 100,
        yStart: 100,
        xEnd: 500,
        yEnd: -1,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: 0,
        xEnd: 7000,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);

    errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: 0,
        xEnd: 500,
        yEnd: 7000,
      }),
      headers: {
        'Content-type': 'application/json',
        token: registrationData[1].token,
      }
    });
    expect(errorRes.statusCode).toBe(BADREQUEST);
  });

  test('Test for invalid token', () => {
    const errorRes = request('POST', `${url}:${port}/user/profile/uploadphoto/v1`, {
      body: JSON.stringify({
        imgUrl: 'http://images.unsplash.com/photo-1533450718592-29d45635f0a9',
        xStart: 0,
        yStart: 0,
        xEnd: 500,
        yEnd: 500,
      }),
      headers: {
        'Content-type': 'application/json',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwic2FsdCI6IiQyYSQxMCRsMVZucmdFaWtJWW9WaTFuMm5IUnh1c0h5RTR2eG91MUpYYVdZQUhxQVpES2ROQkxUOG5CQyIsImlhdCI6MTY1ODU3MTgyMn0.gIEJWGL8CsuXkAodgWWF7jSVleFfR9f60HW-tfao3no'
      }
    });
    expect(errorRes.statusCode).toBe(FORBIDDEN);
  });
});
