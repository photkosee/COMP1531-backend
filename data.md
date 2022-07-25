App Data Structure

let data = {
  'users': [
    {
        'authUserId': integer,
        'nameFirst': 'string',
        'nameLast': 'string',
        'email': 'string',
        'password': 'string',
        'handleStr': 'string',
        'permissionId': integer,
        'isActive': boolean,
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