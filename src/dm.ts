import { getData, setData } from './dataStore';
import { checkToken, tokenToAuthUserId } from './channelHelperFunctions';
const ERROR = { error: 'error' };

function dmCreateV1(token: string, uIds: number[]) {
  /*
    Description:
      dmCreateV1 function will create a dm with members: supplied uIds
      and creator to be the caller.

    Arguments:
      token     string type   -- Input string supplied by user
      uIds      array type    -- Input array supplied by user

    Return Value:
      object: return {dmId: dmId}
      object: return {error: 'error'}
  */
  const data: any = getData();

  if (!(checkToken(token))) {
    return ERROR;
  }

  if (typeof uIds !== 'object' || uIds.length === 0) {
    return ERROR;
  }

  const newCreatorId: number = tokenToAuthUserId(token).authUserId;
  const newDmId: number = data.dms.length + 1;

  const dmName: string[] = [];

  for (const id of uIds) {
    for (const user of data.users) {
      if (id === user.authUserId) {
        if (dmName.includes(user.handleStr)) {
          return ERROR;
        } else {
          dmName.push(user.handleStr);
        }
      }
    }

    if (id === newCreatorId) {
      return ERROR;
    }
  }

  if (dmName.length !== uIds.length) {
    return ERROR;
  }

  dmName.sort();

  const newNameString = dmName.toString().split(',').join(', ');

  data.dms.push({
    dmId: newDmId,
    name: newNameString,
    uIds: [...uIds],
    creatorId: newCreatorId,
    messages: []
  });

  setData(data);
  return { dmId: newDmId };
}

export {
  dmCreateV1
};
