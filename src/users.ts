import { getData } from './dataStore';
import { checkToken } from './channelHelperFunctions';

const ERROR = { error: 'error' };

export function usersAllV1(token: string) {
/*
  Description:
    usersAllV1 returns information about all users' userId,
    email, first name, last name, and handle

  Arguments:
    token integer string  -- Input integer supplied by user

  Return Value:
    Object: { users: users } on success
    Object: {error: 'error'} when given invaid token
*/

  if (!checkToken(token)) {
    return ERROR;
  }

  const data: any = getData();
  const users: any = [];

  for (const user of data.users) {
    users.push({
      uId: user.authUserId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr
    });
  }

  return { users: users };
}
