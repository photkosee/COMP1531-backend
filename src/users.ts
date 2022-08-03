import HTTPError from 'http-errors';
import { getData } from './dataStore';
import { checkToken } from './channelHelperFunctions';
import { utilizationRateCalculator } from './userHelperFunctions';

const FORBIDDEN = 403;

function usersAllV1(token: string, authUserId: number) {
  /*
    Description:
      usersAllV1 returns information about all users' userId,
      email, first name, last name, and handle

    Arguments:
      token       string type  -- string supplied by header
      authUserId  number type  -- number supplied by header

    Expectations:
      FORBIDDEN   - Invalid Session ID or Token

    Return Value:
      Object: { users: users } on success
  */

  if (!(checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();
  const users: any = [];

  for (const user of data.users) {
    if (user.isActive === true) {
      users.push({
        uId: user.authUserId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      });
    }
  }

  return { users: users };
}

function usersStatsV1 (token: string, authUserId: number) {
  /*
    Description:
      usersAllV1 returns information about all users' userId,
      email, first name, last name, and handle

    Arguments:
      token       string type  -- string supplied by header
      authUserId  number type  -- number supplied by header

    Expectations:
      FORBIDDEN   - Invalid Session ID or Token

    Return Value:
      Object: { users: users } on success
  */

  if (!(checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  const data: any = getData();

  data.workspaceStats.utilizationRate = utilizationRateCalculator();

  return { workspaceStats: data.workspaceStats };
}

export {
  usersStatsV1,
  usersAllV1
};
