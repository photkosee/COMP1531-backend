import { getData, setData } from './dataStore';

function clearV1() {
  /*
    Description:
        clearV1 clears the dataStore

    Return Value:
      object: {}
  */
  const data: any = getData();

  data.users = [];
  data.channels = [];
  data.dms = [];
  data.passwordReset = [];
  data.workplaceStats = {};
  data.messageId = 1;
  data.dmId = 1;

  setData(data);
  return {};
}

export { clearV1 };
