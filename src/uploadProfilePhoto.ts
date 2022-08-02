import path from 'path';
import sharp from 'sharp';
import env from './env.json';
import { promisify } from 'util';
import config from './config.json';
import request from 'then-request';
import HTTPError from 'http-errors';
import { promises as fsPromises } from 'fs';
import { getData, setData } from './dataStore';
const sizeOf = promisify(require('image-size'));
import { checkToken } from './channelHelperFunctions';

const deployedUrl: string = env.deployedUrl;
const port = config.port;
const url = config.url;

const BADREQUEST = 400;
const FORBIDDEN = 403;

async function uploadProfilePhoto(token: string, authUserId: number, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  /*
    Description:
      uploadProfilePhoto function helps user to set profile photo

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header
      imgUrl          string type   -- Input string supplied by user
      xStart          number type   -- Input number supplied by user
      yStart          number type   -- Input number supplied by user
      xEnd            number type   -- Input number supplied by user
      yEnd            number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      BADREQUEST - Occurs when xEnd is less than or equal to xStart or yEnd is less than or equal to yStart.
      BADREQUEST - Occurs when imgUrl returned an HTTP status code other than 200.
      BADREQUEST - Occurs when any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL.
      BADREQUEST - Occurs when image uploaded is not a JPG.

    Return Value:
      object: {}
  */

  if (!(checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (xEnd <= xStart ||
      yEnd <= yStart ||
      xStart < 0 ||
      yStart < 0 ||
      xEnd < 0 ||
      yEnd < 0) {
    throw HTTPError(BADREQUEST, 'Invalid Dimmensions');
  }

  const tempFileName = `${(Math.floor(Math.random() * Date.now())).toString().substring(0, 6)}`;

  await request('GET', imgUrl)
    .catch(error => {
      throw HTTPError(BADREQUEST, 'Error occurred when attempting to retrieve the image');
    })
    .then(async function (res: any) {
      if (res.statusCode !== 200) {
        throw HTTPError(BADREQUEST, 'imgUrl returned an HTTP status code other than 200');
      }

      await fsPromises.writeFile(path.join(__dirname, `static/${tempFileName}.jpg`), res.getBody());

      const { height, width, type } = await sizeOf(path.join(__dirname, `static/${tempFileName}.jpg`));

      if (yStart >= height ||
          yEnd >= height ||
          xStart >= width ||
          xEnd >= width) {
        await fsPromises.unlink(path.join(__dirname, `static/${tempFileName}.jpg`));
        throw HTTPError(BADREQUEST, 'Any of xStart, yStart, xEnd, yEnd are not within the dimensions of the image at the URL');
      }

      if (type !== 'jpg' && type !== 'jpeg') {
        await fsPromises.unlink(path.join(__dirname, `static/${tempFileName}.jpg`));
        throw HTTPError(BADREQUEST, 'image uploaded is not a JPG');
      }
    });

  const newFileName = `${(Math.floor(Math.random() * Date.now())).toString().substring(0, 6)}`;
  const outputImage = path.join(__dirname, `static/${newFileName}.jpg`);

  await sharp(path.join(__dirname, `static/${tempFileName}.jpg`))
    .extract({ left: xStart, top: yStart, width: xEnd, height: yEnd })
    .toFile(outputImage)
    .then(async function(newFileInfo: any) {
      await fsPromises.unlink(path.join(__dirname, `static/${tempFileName}.jpg`));
    });

  const newProfileImgUrl = `${process.env.PORT ? deployedUrl : `${url}:${port}`}/static/${newFileName}.jpg`;

  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      user.profileImgUrl = newProfileImgUrl;
    }
  }

  setData(data);
  return {};
}

export {
  uploadProfilePhoto
};
