import { time } from 'console';
import { getData } from './dataStore';

function createUserStats() {
  /*
    Description:
      createUserStats creates inital metrics for user

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

function createWorkplaceStats() {
/*
    Description:
      createWorkplaceStats creates inital for Treats
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);

  const data: any = getData();

  const workplaceStats: any = {
    channelsExist: [
      {
        numChannelsExist: 0,
        timeStamp: timeStamp
      }
    ],
    dmsExist: [
      {
        numDmsExist: 0,
        timeStamp: timeStamp
      }
    ],
    messagesExist: [
      {
        numMessagesExist: 0,
        timeStamp: time
      }
    ],
    utilizationRate: 0
  };

  data.workplaceStats = workplaceStats;
}

function involvementRateCalculator(userId: number) {
/*
    Description:
      involvementRateCalculator calculates involvementRate for a user

    Parameters
      userId    - number given by user

    Return Value:
      number:  involvementRate
*/
  const data: any = getData();

  let numChannelsJoined = 0;
  let numDmsJoined = 0;
  let numMsgsSent = 0;

  for (const user of data.users) {
    if (user.authUserId === userId) {
      numChannelsJoined = user.userStats.channelsJoined[0].numChannelsJoined;
      numDmsJoined = user.userStats.dmsJoined[0].numDmsJoined;
      numMsgsSent = user.userStats.messagesSent[0].numMessagesSent;
    }
  }

  const numChannels: number = data.workplaceStats.channelsExist[0].numChannelsExist;
  const numDms: number = data.workplaceStats.dmsExist[0].numDmsExist;
  const numMsgs: number = data.workplaceStats.messagesExist[0].numMessagesExist;
  const denominator: number = numChannels + numDms + numMsgs;

  if (denominator === 0) {
    return 1;
  }

  const involvementRate: number =
    (numChannelsJoined + numDmsJoined + numMsgsSent) /
    (numChannels + numDms + numMsgs);

  return involvementRate;
}

function utilizationRateCalculator() {
/*
  Description:
    involvementRateCalculator calculates involvementRate for a user

  Parameters
    userId    - number given by user

  Return Value:
    number:  involvementRate
*/
  const data: any = getData();

  let numUsers = 0;
  let numUsersJoined = 0;
  for (const user of data.users) {
    if (user.isActive === true) {
      numUsers++;
      if ((user.userStats.channelsJoined.pop().numChannelsJoined !== 0) ||
           user.userStats.dmsJoined.pop().numDmsJoined !== 0) {
        numUsersJoined++;
      }
    }
  }

  const utilizationRate: number = numUsersJoined / numUsers;

  return utilizationRate;
}

function incrementChannelsJoined(authUserId: number) {
/*
  Description:
    incrementChannelsJoined increments userStats

  Parameters
    authUserId    - number given by user
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);

  const data: any = getData();
  let currNumChannelsJoined = 0;

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      currNumChannelsJoined = user.userStats.channelsJoined.pop().numChannelsJoined;
      user.userStats.channelsJoined.push({
        numChannelsJoined: currNumChannelsJoined++,
        timeStamp: timeStamp
      });
    }
  }
}

function incrementChannelsExist() {
/*
  Description:
    increaseChannelsExist increments workplaceStats

  Parameters
    authUserId    - number given by user
*/
  const data: any = getData();
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);

  let currNumChannelsExist: number =
    data.workplaceStats.channelsExist.pop().numChannelsExist;

  data.workplaceStats.channelsExist.push({
    numChannelsExist: currNumChannelsExist++,
    timeStamp: timeStamp
  });
}

function decreaseChannelsJoined(authUserId: number) {
  /*
    Description:
      decreaseChannelsJoined decreases userStats and channelsExist

    Parameters
      authUserId    - number given by user
  */
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);

  const data: any = getData();
  let currNumChannelsJoined = 0;

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      currNumChannelsJoined = user.userStats.channelsJoined.pop().numChannelsJoined;
      user.userStats.channelsJoined.push({
        numChannelsJoined: currNumChannelsJoined--,
        timeStamp: timeStamp
      });
    }
  }
}

function incrementDmsJoined(authUserId: number) {
/*
  Description:
    incrementDmsJoined increases userStats

  Parameters
    authUserId    - number given by user
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      let currNumDmsJoined: number = user.userStats.dmsJoined.pop().numDmsJoined;
      user.userStats.dmsJoined.push({
        numDmsJoined: currNumDmsJoined++,
        timeStamp: timeStamp
      });
    }
  }
}

function decreaseDmsJoined(authUserId: number) {
/*
  Description:
    decreaseDmsJoined decreases userStats

  Parameters
    authUserId    - number given by user
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      let currNumDmsJoined: number = user.userStats.dmsJoined.pop().numDmsJoined;
      user.userStats.dmsJoined.push({
        numDmsJoined: currNumDmsJoined--,
        timeStamp: timeStamp
      });
    }
  }
}

function incrementDmsExist() {
/*
  Description:
    incrementDmsExist increments workplaceStats
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  let currNumDmsExist: number =
    data.workplaceStats.dmsExist.pop().numDmsExist;

  data.workplaceStats.dmsExist.push({
    numDmsExist: currNumDmsExist++,
    timeStamp: timeStamp
  });
}

function decreaseDmsExist() {
/*
  Description:
    decreaseDmsExist decreases workplaceStats
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  let currNumDmsExist: number =
    data.workplaceStats.dmsExist.pop().numDmsExist;

  data.workplaceStats.dmsExist.push({
    numDmsExist: currNumDmsExist--,
    timeStamp: timeStamp
  });
}

function incrementMessagesSent(authUserId: number) {
/*
  Description:
    incrementMessagesSent increases userStats

  Parameters
    authUserId    - number given by user
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  for (const user of data.users) {
    if (user.authUserId === authUserId) {
      let currMessagesSent: number = user.userStats.messagesSent.pop().numMessagesSent;
      user.userStats.messagesSent.push({
        numMessagesSent: currMessagesSent++,
        timeStamp: timeStamp
      });
    }
  }
}

function incrementMessagesExist() {
/*
  Description:
    incrementMessagesExist increments workplaceStats
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  let currNumMessagesExist: number =
    data.workplaceStats.messagesExist.pop().numMessagesExist;

  data.workplaceStats.messagesExist.push({
    numMessagesExist: currNumMessagesExist++,
    timeStamp: timeStamp
  });
}

function decreaseMessagesExist() {
/*
  Description:
    decreaseMessagesExist decreases workplaceStats
*/
  const timeStamp: number = Math.floor((new Date()).getTime() / 1000);
  const data: any = getData();

  let currNumMessagesExist: number =
    data.workplaceStats.messagesExist.pop().numMessagesExist;

  data.workplaceStats.messagesExist.push({
    numMessagesExist: currNumMessagesExist--,
    timeStamp: timeStamp
  });
}

export {
  createUserStats,
  createWorkplaceStats,
  involvementRateCalculator,
  utilizationRateCalculator,
  incrementChannelsExist,
  incrementChannelsJoined,
  decreaseChannelsJoined,
  incrementDmsJoined,
  decreaseDmsJoined,
  incrementDmsExist,
  decreaseDmsExist,
  incrementMessagesSent,
  incrementMessagesExist,
  decreaseMessagesExist
};
