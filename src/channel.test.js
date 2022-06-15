import { channelDetailsV1 } from './channel.js';
import { getData, setData } from './dataStore'; 
import { clearV1 } from './other';


test ('channelDetailsV1: valid userId and valid channelId', () => {
    clearV1();

    const data = {
        'users': [
            {
                'authUserId': 1,
            },
        ],
        'channels': [
            {
                'channel_id': 10,
                'name': 'F09A_CRUNCHIE',
                'isPublic': false,
                'ownerMembers': [ 1 ],
                'allMembers': [ 1, 2 ],
            },
        ],
    };
    setData(data);

    const dataExpected = {
        'name': 'FO9A_CRUNCHIE',
        'isPublic': false,
        'ownerMembers': [ 1 ],
        'allMembers': [ 1, 2 ],
    }

    expect(channelDetailsV1(1, 10)).toMatchObject(dataExpected);
});

test ('channelDetailsV1: valid userId and non-existent channelId', () => {
    
});

test ('channelDetailsV1: non-existent userId and valid channelId', () => {
    
});

test ('channelDetailsV1: invalid userId and valid channelId', () => {
    
});

test ('channelDetailsV1: valid userId and invalid channelId', () => {
    
});

test ('channelDetailsV1: valid userId but not member', () => {
    
});