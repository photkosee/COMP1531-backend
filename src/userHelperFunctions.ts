import { getData, setData } from './dataStore';

function createUserStats() {
  /*
    Description:
      createUserStats creates inital metrics

    Return Value:
      object:  userStats

  */

  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);

  const userStats: any = {
    channelsJoined: [
      {
        numChannelsJoined: 0,
        timeStamp: timeStamp
      }
    ],
    dmsJoined: [
      {
        numDmsJoined: 0,
        timeStamp: timeStamp
      }
    ],
    messagesSent: [
      {
        numMessagesSent: 0,
        timeStamp: timeStamp
      }
    ],
    involvementRate: 0
  };

  return userStats;
}

export {
  createUserStats
};
