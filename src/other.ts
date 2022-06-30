import { getData, setData } from './dataStore';

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

  setData(data);
  return {};
}

export { clearV1 };
