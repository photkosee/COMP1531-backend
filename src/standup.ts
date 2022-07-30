import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import { authInChannel, checkChannelId, checkToken } from './channelHelperFunctions';

const BADREQUEST = 400;
const FORBIDDEN = 403;

interface newReacts {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean,
}

interface newMessagesDetails {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: newReacts[],
  isPinned: boolean,
}

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
        setTimeout(() => standupOver(channelId, authUserId), (timeFinish - timeNow) * 1000);
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

async function standupSend(token: string, authUserId: number, channelId: number, message: string) {
  /*
    Description:
      standupStart function will start a standup period lasting "length" seconds.

    Arguments:
      token           string type   -- string supplied by request header
      authUserId      number type   -- number supplied by request header
      channelId       number type   -- Input number supplied by user
      message         string type   -- Input string supplied by user

    Exceptions:
      FORBIDDEN  - Occurs when sessionId/token is not found in database.
      BADREQUEST - Occurs when channelId does not refer to a valid channel.
      FORBIDDEN  - Occurs when channelId is valid and the authorised user is not a member of the channel.
      BADREQUEST - Occurs when length of message is over 1000.
      BADREQUEST - Occurs when an active standup is not currently running in the channel.

    Return Value:
      object: {}
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

  if (message.length > 1000) {
    throw HTTPError(BADREQUEST, 'Length of message is over 1000');
  }

  const data: any = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      if (channel.standup.isActive === false) {
        throw HTTPError(BADREQUEST, 'No active standup running in the channel');
      } else {
        let handleStr = '';
        for (const user of data.users) {
          if (user.authUserId === authUserId) {
            handleStr = user.handleStr;
          }
        }
        channel.standup.messagesQueue.push(
          {
            handleStr: handleStr,
            message: message,
          }
        );
        setData(data);
        return {};
      }
    }
  }
}

function standupOver(channelId: number, authUserId: number) {
  const data: any = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId && channel.standup.messagesQueue.length !== 0) {
      channel.standup.isActive = false;
      channel.standup.timeFinish = null;

      let message = '';
      for (let i = 0; i < channel.standup.messagesQueue.length; i++) {
        if (i === 0) {
          message += `${channel.standup.messagesQueue[i].handleStr}: ${channel.standup.messagesQueue[i].message}`;
        } else {
          message += `\n${channel.standup.messagesQueue[i].handleStr}: ${channel.standup.messagesQueue[i].message}`;
        }
      }

      const messageId: number = data.messageId;
      data.messageId += 1;

      const newMessagesDetails: newMessagesDetails = {
        messageId: messageId,
        uId: authUserId,
        message: message,
        timeSent: Math.floor((new Date()).getTime() / 1000),
        reacts: [],
        isPinned: false,
      };

      const newReactsDetails: newReacts = {
        reactId: 1,
        uIds: [],
        isThisUserReacted: false,
      };

      newMessagesDetails.reacts.push(newReactsDetails);
      channel.messages.unshift(newMessagesDetails);
      channel.standup.messagesQueue = [];
    } else if (channel.channelId === channelId) {
      channel.standup.isActive = false;
      channel.standup.timeFinish = null;
      channel.standup.messagesQueue = [];
    }
  }

  setData(data);
  console.log(`Standup over for channel Id: ${channelId}`);
}

export {
  standupStart,
  standupIsActive,
  standupSend
};
