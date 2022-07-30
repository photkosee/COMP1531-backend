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
      const numChannelsJoinedLength: number = user.userStats.channelsJoined.length - 1;
      const numDmsJoinedLength: number = user.userStats.dmsJoined.length - 1;
      const numMessagesJoinedLength: number = user.userStats.messagesSent.length - 1;
      numChannelsJoined = user.userStats.channelsJoined[numChannelsJoinedLength].numChannelsJoined;
      numDmsJoined = user.userStats.dmsJoined[numDmsJoinedLength].numDmsJoined;
      numMsgsSent = user.userStats.messagesSent[numMessagesJoinedLength].numMessagesSent;
    }
  }

  const numChannelsLength: number = data.workplaceStats.channelsExist.length - 1;
  const numDmsLength: number = data.workplaceStats.dmsExist.length - 1;
  const numMsgsLength: number = data.workplaceStats.messagesExist.length - 1;

  const numChannels: number = data.workplaceStats.channelsExist[numChannelsLength].numChannelsExist;
  const numDms: number = data.workplaceStats.dmsExist[numDmsLength].numDmsExist;
  const numMsgs: number = data.workplaceStats.messagesExist[numMsgsLength].numMessagesExist;

  const denominator: number = numChannels + numDms + numMsgs;

  if (denominator === 0) {
    return 0;
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

  // Calculate how many users have joined a channel or dm
  for (const user of data.users) {
    if (user.isActive === true) {
      numUsers = numUsers + 1;

      let isJoined = false;
      const channelsLength: number = user.userStats.channelsJoined.length - 1;
      const dmsLength: number = user.userStats.channelsJoined.length - 1;

      if (user.userStats.channelsJoined[channelsLength].numChannelsJoined !== 0) {
        isJoined = true;
      }
      if (user.userStats.dmsJoined[dmsLength].numDmsJoined !== 0) {
        isJoined = true;
      }
      if (isJoined === true) {
        numUsersJoined = numUsersJoined + 1;
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
      const length = user.userStats.channelsJoined.length - 1;
      currNumChannelsJoined = user.userStats.channelsJoined[length].numChannelsJoined;
      user.userStats.channelsJoined.push({
        numChannelsJoined: currNumChannelsJoined + 1,
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

  const length: number = data.workplaceStats.channelsExist.length - 1;
  const currNumChannelsExist: number =
    data.workplaceStats.channelsExist[length].numChannelsExist;

  data.workplaceStats.channelsExist.push({
    numChannelsExist: currNumChannelsExist + 1,
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
      const length: number = user.userStats.channelsJoined.length - 1;
      currNumChannelsJoined = user.userStats.channelsJoined[length].numChannelsJoined;
      user.userStats.channelsJoined.push({
        numChannelsJoined: currNumChannelsJoined - 1,
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
      const length: number = user.userStats.dmsJoined.length - 1;
      const currNumDmsJoined: number = user.userStats.dmsJoined[length].numDmsJoined;
      user.userStats.dmsJoined.push({
        numDmsJoined: currNumDmsJoined + 1,
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
      const length: number = user.userStats.dmsJoined.length - 1;
      const currNumDmsJoined: number = user.userStats.dmsJoined[length].numDmsJoined;
      user.userStats.dmsJoined.push({
        numDmsJoined: currNumDmsJoined - 1,
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
  const length: number =
  data.workplaceStats.dmsExist.length - 1;

  const currNumDmsExist: number =
    data.workplaceStats.dmsExist[length].numDmsExist;

  data.workplaceStats.dmsExist.push({
    numDmsExist: currNumDmsExist + 1,
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
  const length: number =
  data.workplaceStats.dmsExist.length - 1;

  const currNumDmsExist: number =
    data.workplaceStats.dmsExist[length].numDmsExist;

  data.workplaceStats.dmsExist.push({
    numDmsExist: currNumDmsExist - 1,
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
      const length: number = user.userStats.messagesSent.length - 1;

      const currMessagesSent: number = user.userStats.messagesSent[length].numMessagesSent;
      user.userStats.messagesSent.push({
        numMessagesSent: currMessagesSent + 1,
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
  const length: number =
  data.workplaceStats.messagesExist.length - 1;

  const currNumMessagesExist: number =
    data.workplaceStats.messagesExist[length].numMessagesExist;

  data.workplaceStats.messagesExist.push({
    numMessagesExist: currNumMessagesExist + 1,
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
  const length: number =
  data.workplaceStats.messagesExist.length - 1;

  const currNumMessagesExist: number =
    data.workplaceStats.messagesExist[length].numMessagesExist;

  data.workplaceStats.messagesExist.push({
    numMessagesExist: currNumMessagesExist - 1,
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
