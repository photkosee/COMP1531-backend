import { getData } from './dataStore';
import { checkAuthUserId, checkToken } from './channelHelperFunctions';

const ERROR = { error: 'error' };

function userProfileV1(token: string, uId: number) {
/*
  Description:
    userProfileV1 returns information about uId's userId,
    email, first name, last name, and handle

  Arguments:
    token integer string  -- Input integer supplied by user
    uId   integer type    -- Input integer supplied by user

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
    object: {error: 'error'}
*/

  const data: any = getData();

  if (!(checkToken(token)) || !(checkAuthUserId(uId))) {
    return ERROR;
  }

  for (const user of data.users) {
    if (user.authUserId === uId) {
      return {
        user: {
          uId: user.authUserId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr
        }
      };
    }
  }

  return ERROR;
}

export { userProfileV1 };
