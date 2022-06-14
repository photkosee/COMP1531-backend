// YOU SHOULD MODIFY THIS OBJECT BELOW
let data = {
  // 'users': [
  //   {
  //       'authUserId': integer,
  //       'nameFirst': 'string',
  //       'nameLast': 'string',
  //       'email': 'string',
  //       'password': 'string',
  //       'handleStr': 'string',
  //       'permission_id': [listOfAllChannelIds],
  //   },
  // ],
  // 'channels': [
  //   {
  //     'channel_id': integer,
  //     'name': 'string',
  //     'ownerMembers': [ownerMembersauthUserId],
  //     'allMembers': [allMembersauthUserId],
  //     'isPublic': boolean,
  //     'messages': [{
  //       'messageId': integer,
  //       'message': 'string',
  //       'authUserId' : integer,
  //       'timeCreated': 'string',
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

export { getData, setData };
