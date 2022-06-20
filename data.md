App Data Structure

let data = {
  'users': [],
  'channels': []
  'users': [
    {
        'authUserId': integer,
        'nameFirst': 'string',
        'nameLast': 'string',
        'email': 'string',
        'password': 'string',
        'handleStr': 'string',
        'permissionId': integer,
    },
  ],
  'channels': [
    {
      'channelId': integer,
      'name': 'string',
      'ownerMembers': Array,
      'allMembers': Array,
      'isPublic': boolean,
      'messages': [{
        'messageId': integer,
        'message': 'string',
        'authUserId' : integer,
        'timeCreated': 'integer',
      }],
    },
  ],
};