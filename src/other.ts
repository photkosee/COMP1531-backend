import { getData, setData, setMessageId } from './dataStore';

function clearV1() {
  /*
    Description:
        clearV1 clears the dataStore

    Arguments:

    Return Value:

  */
  const data: any = getData();

  data.users = [];
  data.channels = [];
  data.dms = [];

  setMessageId(0);
  setData(data);
  return {};
}

export { clearV1 };
