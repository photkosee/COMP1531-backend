import HTTPError from 'http-errors';
import { getData } from './dataStore';
import { checkToken } from './channelHelperFunctions';

const FORBIDDEN = 403;

async function notificationsGet(token: string, authUserId: number) {
  /*
    Description:
      notificationGet returns most recent 20 notifications

    Arguments:
      token       string type  -- string supplied by header
      authUserId  number type  -- number supplied by header

    Expectations:
      FORBIDDEN   - Invalid Session ID or Token

    Return Value:
      Object: { notifications: notifications } on success
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  const notificationArray: any = [];

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      for (let i = 0; i < 20 && i < user.notifications.length; i++) {
        notificationArray.push(user.notifications[i]);
      }
    }
  }

  return { notifications: notificationArray };
}

export {
  notificationsGet
};
