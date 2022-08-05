import express, { json, NextFunction, Request, Response } from 'express';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';
import config from './config.json';
import { clearV1 } from './other';
import jwt from 'jsonwebtoken';
import { echo } from './echo';
import env from './env.json';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { searchV1 } from './search';
import { getData, setData } from './dataStore';
import { notificationsGet } from './notifications';
import { usersAllV1, usersStatsV1 } from './users';
import { uploadProfilePhoto } from './uploadProfilePhoto';
import { adminUserpermissionChange, adminUserRemove } from './admin';
import { standupIsActive, standupSend, standupStart } from './standup';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import {
  authRegisterV1,
  authLoginV1,
  authLogoutV1,
  authPasswordResetRequestV1,
  authPasswordResetV1
} from './auth';
import {
  messageSendV1,
  messageEditV1,
  messageSenddmV1,
  messageRemoveV1,
  messageReactV1,
  messageUnreactV1,
  messagePinV1,
  messageUnpinV1,
  messageShareV1,
  messageSendlaterV1,
  messageSendlaterdmV1
} from './message';
import {
  dmCreateV1,
  dmListV1,
  dmRemoveV1,
  dmDetailsV1,
  dmLeaveV1,
  dmMessages
} from './dm';
import {
  userProfileV1,
  userProfileSetnameV1,
  userProfileSetemailV1,
  userProfileSethandleV1,
  userStatsV1
} from './user';
import {
  channelJoinV1,
  channelDetailsV1,
  channelInviteV1,
  channelMessagesV1,
  channelRemoveownerV1,
  channelAddownerV1,
  channelLeaveV1
} from './channel';

// Set up web app, use JSON
const app = express();
app.use(json());

// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const databasePath: string = __dirname + '/database.json';

// Express middleware to save data to database.json on every request end
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', function () {
    const newData: any = getData();
    fs.writeFile(databasePath, JSON.stringify(newData, null, 2), (error) => {
      if (error) {
        // console.log(error);
      } else {
        // console.log('Succesfully written to database.json');
      }
    });
  });
  next();
});

// Express middleware to validate JWT Token
function validateJwtToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('token');
  if (token === undefined || token === null) {
    throw HTTPError(403, 'Invalid Token');
  } else {
    jwt.verify(token, env.jwtSecret, (err, token) => {
      if (err) {
        throw HTTPError(403, 'Invalid Token');
      } else {
        res.locals.token = token;
        next();
      }
    });
  }
}

app.use('/static', express.static(path.join(__dirname, 'static')));

// Example get request
app.get('/echo', (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', (req: Request, res: Response, next: NextFunction) => {
  return res.json(clearV1());
});

app.post('/auth/register/v3', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const returnData = authRegisterV1(email, password, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const returnData = authLoginV1(email, password);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = authLogoutV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const returnData = await authPasswordResetRequestV1(email);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetCode, newPassword } = req.body;
    const returnData = authPasswordResetV1(resetCode, newPassword);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { name, isPublic } = req.body;
    const returnData = channelsCreateV1(token, authUserId, name, isPublic);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = channelsListV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = channelsListallV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = channelInviteV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const channelId = parseInt(req.query.channelId as string);
    const returnData = channelDetailsV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId } = req.body;
    const returnData = channelJoinV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = channelAddownerV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    const returnData = channelMessagesV1(token, authUserId, channelId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = channelRemoveownerV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId } = req.body;
    const returnData = channelLeaveV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const uId = parseInt(req.query.uId as string);
    const returnData = userProfileV1(token, authUserId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = usersAllV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { nameFirst, nameLast } = req.body;
    const returnData = userProfileSetnameV1(token, authUserId, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { email } = req.body;
    const returnData = userProfileSetemailV1(token, authUserId, email);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { handleStr } = req.body;
    const returnData = userProfileSethandleV1(token, authUserId, handleStr);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/user/profile/uploadphoto/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { imgUrl, xStart, yStart, xEnd, yEnd } = req.body;
    const returnData = await uploadProfilePhoto(token, authUserId, imgUrl, xStart, yStart, xEnd, yEnd);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { uIds } = req.body;
    const returnData = dmCreateV1(token, authUserId, uIds);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = dmListV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmRemoveV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmDetailsV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId } = req.body;
    const returnData = dmLeaveV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    const returnData = dmMessages(token, authUserId, dmId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, message } = req.body;
    const returnData = messageSendV1(token, authUserId, channelId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const messageId = parseInt(req.query.messageId as string);
    const returnData = messageRemoveV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, message } = req.body;
    const returnData = messageEditV1(token, authUserId, messageId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId, message } = req.body;
    const returnData = messageSenddmV1(token, authUserId, dmId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, reactId } = req.body;
    const returnData = messageReactV1(token, authUserId, messageId, reactId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, reactId } = req.body;
    const returnData = messageUnreactV1(token, authUserId, messageId, reactId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId } = req.body;
    const returnData = messagePinV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId } = req.body;
    const returnData = messageUnpinV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { ogMessageId, message, channelId, dmId } = req.body;
    const returnData = messageShareV1(token, authUserId, ogMessageId, message, channelId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, message, timeSent } = req.body;
    const returnData = messageSendlaterV1(token, authUserId, channelId, message, timeSent);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId, message, timeSent } = req.body;
    const returnData = messageSendlaterdmV1(token, authUserId, dmId, message, timeSent);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId, message, timeSent } = req.body;
    const returnData = messageSendlaterdmV1(token, authUserId, dmId, message, timeSent);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const uId = parseInt(req.query.uId as string);
    const returnData = adminUserRemove(token, authUserId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { uId, permissionId } = req.body;
    const returnData = adminUserpermissionChange(token, authUserId, uId, permissionId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/user/stats/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = userStatsV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/users/stats/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = usersStatsV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, length } = req.body;
    const returnData = standupStart(token, authUserId, channelId, length);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/standup/active/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const channelId = parseInt(req.query.channelId as string);
    const returnData = standupIsActive(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, message } = req.body;
    const returnData = standupSend(token, authUserId, channelId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/notifications/get/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = notificationsGet(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/search/v1', validateJwtToken, (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const queryStr = (req.query.queryStr as string);
    const returnData = searchV1(token, authUserId, queryStr);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, () => {
  console.log(`⚡️ Server listening on port ${PORT}`);

  // Loads data from database.json to dataStore on server initialization
  fs.readFile(databasePath, 'utf-8', (error, jsonData) => {
    const database = JSON.parse(jsonData);
    setData(database);
  });
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
