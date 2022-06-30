import express from 'express';
import morgan from 'morgan';
import config from './config.json';
import fs from 'fs';
import { getData, setData } from './dataStore';
import { echo } from './echo';
import { clearV1 } from './other';
import { authRegisterV1, authLoginV1 } from './auth';

// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
const databasePath: string = __dirname + '/database.json';

// Express middleware to save data to database.json on every request end
app.use((req, res, next) => {
  req.on('end', function () {
    const newData: any = getData();
    fs.writeFile(databasePath, JSON.stringify(newData), (error) => {
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
    clearV1();
    return res.json({});
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

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);

  // Loads data from database.json to dataStore on server initialization
  fs.readFile(databasePath, 'utf-8', (error, jsonData) => {
    if (error) {
      console.log(error);
      return error;
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
