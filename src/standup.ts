import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { authInChannel, checkChannelId, checkToken } from './channelHelperFunctions';

const BADREQUEST = 400;
const FORBIDDEN = 403;

async function standupStart(token: string, authUserId: number, channelId: number, length: number) {
  /*
    Description:
      standupStart function will start a standup period lasting "length" seconds.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header
      channelId       number type   -- Input number supplied by user
      length          number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      BADREQUEST - Occurs when channelId does not refer to a valid channel.
      BADREQUEST - Occurs when length is a negative integer.
      BADREQUEST - Occurs when an active standup is currently running in the channel.
      FORBIDDEN  - Occurs when channelId is valid and the authorised user is not a member of the channel.

    Return Value:
      object: {timeFinish: timeFinish}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }

  if (!(authInChannel(channelId, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Authorised user is not a member of the channel');
  }

  if (length < 0) {
    throw HTTPError(BADREQUEST, 'Length must be a positive integer');
  }

  const data: any = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.standup.isActive === true) {
        throw HTTPError(BADREQUEST, 'An active standup is currently running in the channel');
      } else {
        channel.standup.isActive = true;
        const timeNow = Math.floor((new Date()).getTime() / 1000);
        const timeFinish = (timeNow + length);
        channel.standup.timeFinish = timeFinish;
        setData(data);
        setTimeout(standupOver, (timeFinish - timeNow) * 1000);
        return { timeFinish: timeFinish };
      }
    }
  }
}

async function standupIsActive(token: string, authUserId: number, channelId: number) {
  /*
    Description:
      standupStart function will start a standup period lasting "length" seconds.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header
      channelId       number type   -- Input number supplied by user

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      BADREQUEST - Occurs when channelId does not refer to a valid channel.
      FORBIDDEN  - Occurs when channelId is valid and the authorised user is not a member of the channel.

    Return Value:
      object: {isActive: boolean, timeFinish: timeFinish}
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!checkChannelId(channelId)) {
    throw HTTPError(BADREQUEST, 'Invalid channelId');
  }

  if (!(authInChannel(channelId, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Authorised user is not a member of the channel');
  }

  const data: any = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return {
        isActive: channel.standup.isActive,
        timeFinish: channel.standup.timeFinish
      };
    }
  }
}

function standupOver() {
  console.log('Check status Standup');
}

export {
  standupStart,
  standupIsActive
};
