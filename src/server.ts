require('dotenv').config();
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
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import {
  messageSendV1,
  messageEditV1,
  messageSenddmV1,
  messageRemoveV1
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
import console from 'console';

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
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
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
    const returnData = await authLogoutV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, name, isPublic } = req.body;
    const returnData = channelsCreateV1(token, name, isPublic);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const returnData = channelsListV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const returnData = channelsListallV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId, uId } = req.body;
    const returnData = channelInviteV1(token, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const channelIdReq = req.query.channelId;
    const channelId = +channelIdReq;
    const returnData = channelDetailsV1(token, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId } = req.body;
    const returnData = channelJoinV1(token, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId, uId } = req.body;
    const returnData = channelAddownerV1(token, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const channelId = +req.query.channelId;
    const start = +req.query.start;
    const returnData = channelMessagesV1(token, channelId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId, uId } = req.body;
    const returnData = channelRemoveownerV1(token, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId } = req.body;
    const returnData = channelLeaveV1(token, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v2', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const uIdReq = req.query.uId;
    const uId = +uIdReq;
    const returnData = userProfileV1(token, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const returnData = usersAllV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, nameFirst, nameLast } = req.body;
    const returnData = userProfileSetnameV1(token, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, email } = req.body;
    const returnData = userProfileSetemailV1(token, email);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, handleStr } = req.body;
    const returnData = userProfileSethandleV1(token, handleStr);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, uIds } = req.body;
    const returnData = dmCreateV1(token, uIds);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const returnData = dmListV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmRemoveV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmDetailsV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, dmId } = req.body;
    const returnData = dmLeaveV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const start = parseInt(req.query.start as string);
    const returnData = dmMessages(token, dmId, start);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, channelId, message } = req.body;
    const returnData = messageSendV1(token, channelId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;
    const messageId = parseInt(req.query.messageId as string);
    const returnData = messageRemoveV1(token, messageId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, messageId, message } = req.body;
    const returnData = messageEditV1(token, messageId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v1', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, dmId, message } = req.body;
    const returnData = messageSenddmV1(token, dmId, message);
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
app.listen(PORT, HOST, () => {
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
