import { getData } from './dataStore';

const GLOBAL = 1;

function checkPermissionId(permissionId: number) {
  /*
  Description:
    checkPermissionId checks validity of given permission id

  Arguments:
    permissionId  number type -- number supplied by user

  Return Value:
    boolean:  'true' if valid, 'false' if invalid
*/

  if (typeof (permissionId) !== 'number') {
    return false;
  }

  if (permissionId !== 1 && permissionId !== 2) {
    return false;
  }

  return true;
}

function findPermissionId(userId: number) {
/*
  Description:
    findPermissionId finds the permission id given a valid user Id

  Arguments:
    userId    number type -- number supplied by header

  Return Value:
    number: 1 if global owner, 2 if member
*/

  const data: any = getData();
  let foundPermissionId = 0;
  for (const user of data.users) {
    if (userId === user.authUserId) {
      foundPermissionId = user.permissionId;
    }
  }

  return foundPermissionId;
}

function isOnlyGlobalOwner(userId: number) {
/*
  Description:
    isOnlyGlobalOwner determines if user is the only global owner in Treats

  Arguments:
    userId    number type -- number supplied by header

  Return Value:
    boolean:  'true' if they're the only global owner
              'false' if other global owners exist
*/

  const data: any = getData();

  for (const user of data.users) {
    if (userId !== user.authUserId) {
      if (user.permissionId === GLOBAL) {
        return false;
      }
    }
  }

  return true;
}

export {
  checkPermissionId,
  findPermissionId,
  isOnlyGlobalOwner
};
