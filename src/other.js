import {getData, setData} from './dataStore.js';

function clearV1() {

  	/*
		Description:
			clearV1 clears the dataStore before each jest test. 
    
		Arguments:
			
		Return Value:

	*/

  let data = getData();
  
  data['users'] = [];
  data['channels'] = [];

  setData(data);
  return {};

};

export { clearV1 };
