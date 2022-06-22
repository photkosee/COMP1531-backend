// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  'users': [],
  'channels': [],
  // 'users': [
  //   {
  //       'authUserId': integer,
  //       'nameFirst': 'string',
  //       'nameLast': 'string',
  //       'email': 'string',
  //       'password': 'string',
  //       'handleStr': 'string',
  //       'permissionId': integer,
  //       'isActive': boolean,
  //   },
  // ],
  // 'channels': [
  //   {
  //     'channelId': integer,
  //     'name': 'string',
  //     'ownerMembers': Array,
  //     'allMembers': Array,
  //     'isPublic': boolean,
  //     'messages': [{
  //       'messageId': integer,
  //       'message': 'string',
  //       'authUserId' : integer,
  //       'timeCreated': 'integer',
  //     }],
  //   },
  // ],
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
function setData(newData) {
  data = newData;
}

export {
  getData,
  setData
};
