let data: object = {
  users: [
    // {
    //   token: 'string',
    //   authUserId: 'number',
    //   nameFirst: 'string',
    //   nameLast: 'string',
    //   email: 'string',
    //   password: 'string',
    //   handleStr: 'string',
    //   permissionId: 'number',
    //   sessionList: 'Array',
    //   isActive: 'boolean',
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
    //       message: 'string',
    //       authUserId: 'number',
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
    //       authUserId: 'number',
    //       timeCreated: 'number',
    //     }
    //   ]
    // }
  ],
};

let messageId: number = 0;

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

// Use get() to access the Id
export function getMessageId() {
  return messageId;
}

// Use set(newData) to pass in the Id, with modifications made
export function setMessageId(newId: number) {
  messageId = newId;
}

export {
  getData,
  setData
};
