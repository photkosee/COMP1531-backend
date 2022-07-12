import { getData } from './dataStore';

function dmIdValidator(dmId: number) {
  /*
    Description:
      dmIdValidator checks validity and existence of dmId

    Arguments:
      dmId     integer type  -- Input number supplied by caller function

    Return Value:
      boolean: 'true' if valid, 'false' if invalid or non-existent
  */

  const data: any = getData();

  if (typeof dmId !== 'number') {
    return false;
  }

  for (const dm of data.dms) {
    if (dmId === dm.dmId) {
      return true;
    }
  }
  return false;
}

function checkDmMember(dmId: number, userId: number) {
  /*
    Description:
      checkDmMember checks if given user is a member of the given dm

    Arguments:
      dmId      integer type   -- Input number supplied by user
      userId    integer type   -- Input number supplied by user

    Return Value:
      boolean: 'true' if user in channel, 'false' if not in dm
  */

  const data: any = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.uIds.includes(userId)) {
        return true;
      }
    }
  }

  return false;
}

function getDmMessages(dmId: number) {
  /*
    Description:
      getDmMessages returns array of messages of a given dmId

    Arguments:
      dmId     integer type  -- Input integer supplied by user

    Return Value:
      array:  messages of a given dmId
  */

  const data: any = getData();

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return [...dm.messages];
    }
  }
}

export {
  dmIdValidator,
  checkDmMember,
  getDmMessages
};
