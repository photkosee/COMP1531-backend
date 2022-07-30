import express, { json, NextFunction, Request, Response } from 'express';
import errorHandler from 'middleware-http-errors';
import HTTPError from 'http-errors';
import path from 'path';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';
import { echo } from './echo';
import { clearV1 } from './other';
import config from './config.json';
import { usersAllV1 } from './users';
import { getData, setData } from './dataStore';
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
  messageShareV1
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
  userProfileSethandleV1
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
import { adminUserpermissionChange, adminUserRemove } from './admin';
import { standupStart } from './standup';

// Set up web app, use JSON
const app = express();
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
const databasePath: string = __dirname + '/database.json';

app.use('/static', express.static(path.join(__dirname, 'static')));

// Express middleware to save data to database.json on every request end
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', function () {
    const newData: any = getData();

    fs.writeFile(databasePath, JSON.stringify(newData, null, 2), (error) => {
      if (error) {
        console.log(error);
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
    jwt.verify(token, '4ee66c5740fece1be9fdc0e269dd77ef7ea99874ee617bcfb2dae2c429f18acb', (err, token) => {
      if (err) {
        throw HTTPError(403, 'Invalid Token');
      } else {
        res.locals.token = token;
        next();
      }
    });
  }
}

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
  try {
    return res.json(clearV1());
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const returnData = await authRegisterV1(email, password, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const returnData = await authLoginV1(email, password);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = await authLogoutV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { name, isPublic } = req.body;
    const returnData = await channelsCreateV1(token, authUserId, name, isPublic);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = await channelsListV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = await channelsListallV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = await channelInviteV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const channelId = parseInt(req.query.channelId as string);
    const returnData = await channelDetailsV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId } = req.body;
    const returnData = await channelJoinV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = await channelAddownerV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const channelId = parseInt(req.query.channelId as string);
    const start = parseInt(req.query.start as string);
    const returnData = await channelMessagesV1(token, authUserId, channelId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, uId } = req.body;
    const returnData = await channelRemoveownerV1(token, authUserId, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId } = req.body;
    const returnData = await channelLeaveV1(token, authUserId, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v3', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const uId = parseInt(req.query.uId as string);
    const returnData = await userProfileV1(token, authUserId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', validateJwtToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = await usersAllV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { nameFirst, nameLast } = req.body;
    const returnData = await userProfileSetnameV1(token, authUserId, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { email } = req.body;
    const returnData = await userProfileSetemailV1(token, authUserId, email);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { handleStr } = req.body;
    const returnData = await userProfileSethandleV1(token, authUserId, handleStr);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { uIds } = req.body;
    const returnData = await dmCreateV1(token, authUserId, uIds);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const returnData = await dmListV1(token, authUserId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = await dmRemoveV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = await dmDetailsV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId } = req.body;
    const returnData = await dmLeaveV1(token, authUserId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    const returnData = await dmMessages(token, authUserId, dmId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, message } = req.body;
    const returnData = await messageSendV1(token, authUserId, channelId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const messageId = parseInt(req.query.messageId as string);
    const returnData = await messageRemoveV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, message } = req.body;
    const returnData = await messageEditV1(token, authUserId, messageId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { dmId, message } = req.body;
    const returnData = await messageSenddmV1(token, authUserId, dmId, message);
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

app.post('/auth/passwordreset/reset/v1', async(req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetCode, newPassword } = req.body;
    const returnData = await authPasswordResetV1(resetCode, newPassword);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, reactId } = req.body;
    const returnData = await messageReactV1(token, authUserId, messageId, reactId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId, reactId } = req.body;
    const returnData = await messageUnreactV1(token, authUserId, messageId, reactId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId } = req.body;
    const returnData = await messagePinV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { messageId } = req.body;
    const returnData = await messageUnpinV1(token, authUserId, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/share/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { ogMessageId, message, channelId, dmId } = req.body;
    const returnData = await messageShareV1(token, authUserId, ogMessageId, message, channelId, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/user/remove/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const uId = parseInt(req.query.uId as string);
    const returnData = await adminUserRemove(token, authUserId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/admin/userpermission/change/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { uId, permissionId } = req.body;
    const returnData = await adminUserpermissionChange(token, authUserId, uId, permissionId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', validateJwtToken, async(req: Request, res: Response, next: NextFunction) => {
  try {
    const token = res.locals.token.salt;
    const authUserId = res.locals.token.id;
    const { channelId, length } = req.body;
    const returnData = await standupStart(token, authUserId, channelId, length);
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
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);

  // Loads data from database.json to dataStore on server initialization
  fs.readFile(databasePath, 'utf-8', (error, jsonData) => {
    if (error) {
      console.log(`Error Initialising Datastore -> ${error.message}`);
      console.log('Creating new Database file');

      const newData: any = getData();

      fs.writeFile(databasePath, JSON.stringify(newData, null, 2), (error) => {
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log('Succesfully created database.json file');
        }
      });

      return {};
    }

    try {
      const database = JSON.parse(jsonData);
      setData(database);
      console.log('DataStore Initialized Successfully');
      return {};
    } catch (error) {
      console.log(error);
      return error;
    }
  });
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
