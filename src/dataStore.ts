let data: object = {
  users: [
    // {
    //   authUserId: 'number',
    //   nameFirst: 'string',
    //   nameLast: 'string',
    //   email: 'string',
    //   password: 'string',
    //   handleStr: 'string',
    //   profileImgUrl: 'string',
    //   permissionId: 'number',
    //   isActive: 'boolean',
    //   sessionList: 'Array<tokens>'
    //   userStats: {
    //    channelsJoined: [
    //      {
    //        numChannelsJoined: 'number',
    //        timeStamp: 'number'
    //      }
    //    ],
    //    dmsJoined: [
    //      {
    //        numDmsJoined: 'number',
    //        timeStamp: 'number'
    //      }
    //    ],
    //    messagesSent: [
    //      {
    //        numMessagesSent: 'number',
    //        timeStamp: 'number'
    //      }
    //    ],
    //    involvementRate: 'number'
    //   }
    // }
  ],
  channels: [
    // {
    //   channelId: 'number',
    //   name: 'string',
    //   ownerMembers: 'Array',
    //   allMembers: 'Array',
    //   isPublic: 'boolean',
    //   messages: [
    //     {
    //       messageId: 'number',
    //       uId: 'number',
    //       message: 'string',
    //       timeSent: 'number',
    //       reacts: [
    //         {
    //           reactId: 'number',
    //           uIds: 'Array',
    //           isThisUserReacted: 'boolean'
    //         },
    //       ],
    //       isPinned: 'boolean',
    //     }
    //   ],
    // }
  ],
  dms: [
    // {
    //   dmId: 'number',
    //   name: 'string',
    //   uIds: 'Array',
    //   creatorId: 'number',
    //   messages: [
    //     {
    //       messageId: 'number',
    //       uId: 'number',
    //       message: 'string',
    //       timeSent: 'number',
    //       reacts: [
    //         {
    //           reactId: 'number',
    //           uIds: 'Array',
    //           isThisUserReacted: 'boolean'
    //         },
    //       ]
    //       isPinned: 'boolean',
    //     },
    //   ],
    // }
  ],
  passwordReset: [
    // {
    //   email: 'string',
    //   resetCode: 'string',
    // }
  ],
  workplaceStats: {
    // channelsExist: [
    //  {
    //    numChannelsExist: 'number',
    //    timeStamp: 'number
    //  }
    // ],
    // dmsExist: [
    //  {
    //    numDmsExist: 'number',
    //    timeStamp: 'number'
    //  }
    // ],
    // messagesExist: [
    //  {
    //    numMessagesExist: 'number',
    //    timeStamp: 'number'
    //  }
    // ],
    // utilizationRate: 'number'
  },
  messageId: 1,
  dmId: 1
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData() {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: object) {
  data = newData;
}

export {
  getData,
  setData
};
