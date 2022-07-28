import { getData } from './dataStore';
import HTTPError from 'http-errors';
import { checkToken, authInChannel } from './channelHelperFunctions';
import { checkDmMember } from './dmHelperFunctions';

const BADREQUEST = 400;
const FORBIDDEN = 403;

async function searchV1(token: string, authUserId:number, queryStr: string) {
  /*
    Description:
      searchV1 searches for messages from channel/dm

    Arguments:
      token         string type   -- string supplied by request header
      authUserId    number type   -- number supplied by request header
      queryStr      string type   -- string supplied by request header

    Exceptions:
      FORBIDDEN   - Invalid Session ID or Token
      BADREQUEST  - Invalid queryStr

    Return Value:
      object: { messages: messages }
  */

  if (!(await checkToken(token, authUserId))) {
    throw HTTPError(FORBIDDEN, 'Invalid Session ID or Token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(BADREQUEST, 'Query string with valid length');
  }

  const data: any = getData();

  const queryString: string = queryStr.toLowerCase();
  const queryMessages: string[] = [];

  for (const channel of data.channels) {
    if (authInChannel(channel.channelId, authUserId)) {
      for (const element of channel.messages) {
        if (element.message.toLowerCase().includes(queryString)) {
          queryMessages.push(element);
        }
      }
    }
  }

  for (const dm of data.dms) {
    if (checkDmMember(dm.dmId, authUserId)) {
      for (const element of dm.messages) {
        if (element.message.toLowerCase().includes(queryString)) {
          queryMessages.push(element);
        }
      }
    }
  }

  return { messages: queryMessages };
}

export { searchV1 };
