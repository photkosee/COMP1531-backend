import { getData } from './dataStore';
import { checkAuthUserId, checkToken } from './channelHelperFunctions';
import { checkPermissionId, findPermissionId, isOnlyGlobalOwner,
  replaceUsersMessages, replaceUserDms, removeUserChannelMembers,
  removeUserChannelOwners, removeUserFromDms } from './adminHelperFunctions';
import HTTPError from 'http-errors';

const BADREQUEST = 400;
const FORBIDDEN = 403;

const GLOBAL = 1;
const MEMBER = 2;

interface USER {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
}

async function adminUserpermissionChange(token: string, authUserId: number,
  uId: number, permissionId: number) {
/*
  Description:
    adminUserpermissionChange changes the user's permissionId to GLOBAL or MEMBER

  Arguments:
    token         string type -- string supplied by header
    authUserId    number type -- number supplied by header
    uId           number type -- number supplied by user
    permissionId  number type -- number supplied by user

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token
    BADREQUEST  - User Id is invalid
    BADREQUEST  - Permission Id is invalid
    BADREQUEST  - authorised user is not global owner
    BADREQUEST  - user already has permissionId
    BADREQUEST  - Cannot demote only global owner to member

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
*/
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!(checkAuthUserId(uId))) {
    throw HTTPError(BADREQUEST, 'User Id is invalid');
  }

  if (!(checkPermissionId(permissionId))) {
    throw HTTPError(BADREQUEST, 'Permission Id is invalid');
  }

  const authPermissionId: number = findPermissionId(authUserId);
  if (authPermissionId !== GLOBAL) {
    throw HTTPError(FORBIDDEN, 'authorised user is not global owner');
  }

  const userPermissionId: number = findPermissionId(uId);
  if (userPermissionId === permissionId) {
    throw HTTPError(BADREQUEST, 'user already has permissionId');
  }

  if (userPermissionId === GLOBAL && permissionId === MEMBER) {
    if (isOnlyGlobalOwner(uId)) {
      throw HTTPError(BADREQUEST, 'Cannot demote only global owner to member');
    }
  }

  const data: any = getData();
  for (const user of data.users) {
    if (uId === user.authUserId) {
      user.permissionId = permissionId;
    }
  }

  return {};
}

async function adminUserRemove(token: string, authUserId: number, uId: number) {
/*
  Description:
    adminUserRemove removes a user from treats

  Arguments:
    token         string type -- string supplied by header
    authUserId    number type -- number supplied by header
    uId           number type -- number supplied by user

  Exceptions:
    FORBIDDEN   - Invalid Session ID or Token
    BADREQUEST  - User Id is invalid
    BADREQUEST  - authorised user is not global owner

  Return Value:
    Object: { user: { uId, email, nameFirst, nameLast, handleStr } }
*/

  // Checking parameter validity
  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (!(checkAuthUserId(uId))) {
    throw HTTPError(BADREQUEST, 'User Id is invalid');
  }

  const authPermissionId: number = findPermissionId(authUserId);
  if (authPermissionId !== GLOBAL) {
    throw HTTPError(FORBIDDEN, 'authorised user is not global owner');
  }

  // Make user inactive
  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === uId) {
      user.isActive = false;
      user.nameFirst = 'Removed';
      user.nameLast = 'user';
    }
  }

  // Change channel messages
  replaceUsersMessages(uId);

  // Change dm messages
  replaceUserDms(uId);

  // Remove from channels
  removeUserChannelMembers(uId);

  removeUserChannelOwners(uId);

  // Remove from DM's
  removeUserFromDms(uId);

  return {};
}

export {
  adminUserpermissionChange,
  adminUserRemove
};
