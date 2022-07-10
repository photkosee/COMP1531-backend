
import request from 'sync-request';
import config from '../src/config.json';

const OK = 200;
const port = config.port;
const url = config.url;
const ERROR = { error: 'error' };


beforeEach(() => {
  request('DELETE', `${url}:${port}/clear/v1`);
});

const channelLeave = (token: string, channdId: number) => {
    const res = request('POST', `${url}:${port}/channel/leave/v1`, {
        json: {
            token: token,
            channelId: channelId,
        }
    })
    const bodyObj = JSON.parse(res.body as string);
}

test('Testing for invalid input in channel/leave/v1', () => {
    
})



test('Testing for invalid input in channel/leave/v1', () => {
    
})
test('Testing for invalid input in channel/leave/v1', () => {
    
})
test('Testing for invalid input in channel/leave/v1', () => {
    
})