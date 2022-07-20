let data: object = {
  users: [
    {
      // authUserId: 'number',
      // nameFirst: 'string',
      // nameLast: 'string',
      // email: 'string',
      // password: 'string',
      // handleStr: 'string',
      // profileImgUrl: 'string',
      // permissionId: 'number',
      // isActive: 'boolean',
      // sessionList: 'Array<tokens>'
    }
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
    //       message: 'string',
    //       uId: 'number',
    //       timeCreated: 'number',
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
    //       message: 'string',
    //       uId: 'number',
    //       timeCreated: 'number',
    //     }
    //   ]
    // }
  ],
  messageId: 1,
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
