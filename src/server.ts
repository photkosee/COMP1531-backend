import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config.json';
import fs from 'fs';
import { getData, setData } from './dataStore';
import { echo } from './echo';
import { clearV1 } from './other';
import { authRegisterV1, authLoginV1, authLogoutV1 } from './auth';
import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels';
import { channelJoinV1, channelDetailsV1, channelInviteV1, channelMessagesV1 } from './channel';
import { userProfileV1, userProfileSetnameV1 } from './user';
import { dmCreateV1, dmListV1, dmRemoveV1, dmDetailsV1, dmLeaveV1 } from './dm';
import { messageSendV1 } from './message';
import { usersAllV1 } from './users';

// Set up web app, use JSON
const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
const databasePath: string = __dirname + '/database.json';

// Express middleware to save data to database.json on every request end
app.use((req, res, next) => {
  res.on('finish', function () {
    const newData: any = getData();

    fs.writeFile(databasePath, JSON.stringify(newData, null, 2), (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Succesfully written to database.json');
      }
    });
  });
  next();
});

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.delete('/clear/v1', (req, res, next) => {
  try {
    return res.json(clearV1());
  } catch (err) {
    next(err);
  }
});

app.post('/auth/register/v2', (req, res, next) => {
  try {
    const { email, password, nameFirst, nameLast } = req.body;
    const returnData = authRegisterV1(email, password, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v2', (req, res, next) => {
  try {
    const { email, password } = req.body;
    const returnData = authLoginV1(email, password);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v1', (req, res, next) => {
  try {
    const { token } = req.body;
    const returnData = authLogoutV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    const returnData = channelsCreateV1(token, name, isPublic);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const returnData = channelsListV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v2', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const returnData = channelsListallV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v2', (req, res, next) => {
  try {
    const { token, channelId, uId } = req.body;
    const returnData = channelInviteV1(token, channelId, uId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/channel/details/v2', (req, res, next) => {
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

app.post('/channel/join/v2', (req, res, next) => {
  try {
    const { token, channelId } = req.body;
    const returnData = channelJoinV1(token, channelId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/user/profile/v2', (req, res, next) => {
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

app.get('/channel/messages/v2', (req, res, next) => {
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

app.post('/dm/create/v1', (req, res, next) => {
  try {
    const { token, uIds } = req.body;
    const returnData = dmCreateV1(token, uIds);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const returnData = dmListV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmRemoveV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    const returnData = dmDetailsV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v1', (req, res, next) => {
  try {
    const { token, dmId } = req.body;
    const returnData = dmLeaveV1(token, dmId);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.post('/message/send/v1', (req, res, next) => {
  try {
    const { token, channelId, message } = req.body;
    const returnData = messageSendV1(token, channelId, message);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v1', (req, res, next) => {
  try {
    const token = req.query.token as string;
    const returnData = usersAllV1(token);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v1', (req, res, next) => {
  try {
    const { token, nameFirst, nameLast } = req.body;
    const returnData = userProfileSetnameV1(token, nameFirst, nameLast);
    return res.json(returnData);
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

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
