```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design
```

let data = {
  'users': [
    {
        'authUserId': integer,
        'nameFirst': 'string',
        'nameLast': 'string',
        'email': 'string',
        'password': 'string',
        'handleStr': 'string',
        'permission_id': [listOfAllChannelIds],
    },
  ],
  'channels': [
    {
      'channel_id': integer,
      'name': 'string',
      'ownerMembers': [ownerMembersauthUserId],
      'allMembers': [allMembersauthUserId],
      'isPublic': boolean,
      'messages': [{
        'messageId': integer,
        'message': 'string',
        'authUserId' : integer,
        'timeCreated': 'string',
      }],
    },
  ],
};