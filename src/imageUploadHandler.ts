import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import config from './config.json';
import env from './env.json';
import path from 'path';
import fs from 'fs';
import { dmIdValidator } from './dmHelperFunctions';
import { checkToken, checkChannelId } from './channelHelperFunctions';
import { incrementMessagesExist, incrementMessagesSent } from './userHelperFunctions';

const deployedUrl: string = env.deployedUrl;
const port = config.port;
const url = config.url;

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

function sendImageV1(token: string, authUserId: number, channelId: number, dmId: number, filename: string) {
  if (!(checkToken(token, authUserId))) {
    fs.unlink(path.join(__dirname, `uploads/${filename}`), err => {
      if (err) console.log(err);
    });
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  if (channelId !== -1) {
    if (!checkChannelId(channelId)) {
      fs.unlink(path.join(__dirname, `uploads/${filename}`), err => {
        if (err) console.log(err);
      });
      throw HTTPError(BADREQUEST, 'Invalid channelId');
    }

    for (const channel of data.channels) {
      if (channelId === channel.channelId) {
        for (const member of channel.allMembers) {
          if (member.uId === authUserId) {
            const messageId: number = data.messageId;
            data.messageId += 1;

            const newMessagesDetails: newMessagesDetails = {
              messageId: messageId,
              uId: authUserId,
              message: `${process.env.PORT ? deployedUrl : `${url}:${port}`}/uploads/${filename}`,
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

            incrementMessagesExist();
            incrementMessagesSent(authUserId);

            setData(data);
            return { messageId: messageId };
          }
        }
      }
    }
  } else {
    if (!(dmIdValidator(dmId))) {
      fs.unlink(path.join(__dirname, `uploads/${filename}`), err => {
        if (err) console.log(err);
      });
      throw HTTPError(BADREQUEST, 'dmId does not refer to a valid DM');
    }

    for (const dm of data.dms) {
      if (dmId === dm.dmId && (dm.creatorId === authUserId || dm.uIds.includes(authUserId))) {
        const messageId: number = data.messageId;
        data.messageId += 1;
        const newMessagesDetails: newMessagesDetails = {
          messageId: messageId,
          uId: authUserId,
          message: `${process.env.PORT ? deployedUrl : `${url}:${port}`}/uploads/${filename}`,
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
        dm.messages.unshift(newMessagesDetails);

        incrementMessagesExist();
        incrementMessagesSent(authUserId);

        setData(data);
        return { messageId: messageId };
      }
    }
  }

  fs.unlink(path.join(__dirname, `uploads/${filename}`), err => {
    if (err) console.log(err);
  });

  throw HTTPError(FORBIDDEN, 'You are not a member');
}

export {
  sendImageV1
};
