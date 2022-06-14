import {getData, setData} from './dataStore';

function clearV1() {
  let data = getData();
  data['users'] = [];
  data['channels'] = [];
  setData(data);
  return data;
}

export { clearV1 };
