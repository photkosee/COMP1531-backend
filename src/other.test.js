import { clearV1 } from './other';
import {getData, setData} from './dataStore'; 


test('Test clearV1 return type', () => {
    const result = clearV1();
    expect(typeof result).toBe('object');
    expect(result).toMatchObject({});
});

test('Test clearV1 functionality', () => {

    clearV1();

    const data = {
        'users': [
            {   
                'authUserId': 1,
                'nameFirst': 'Mridul',
                'nameLast': 'Singh',
                'email': 'mridul@gmail.com',
                'password': 'Mridul@#Singh1',
            },
        ],
        'channels': [
            {
                'channel_id': 1,
                'name': 'F09A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [1],
                'allMembers': [1],
            },
        ],
    };
    
    setData(data);

    let dataReceived = getData();
    expect(dataReceived).toMatchObject(data);

    const result = clearV1();
    dataReceived = getData();

    expect(dataReceived).toMatchObject(result);
});