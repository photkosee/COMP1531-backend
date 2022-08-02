App Data Structure

let data: object = {
  users: [
    {
      authUserId: 'number',
      nameFirst: 'string',
      nameLast: 'string',
      email: 'string',
      password: 'string',
      handleStr: 'string',
      profileImgUrl: 'string',
      permissionId: 'number',
      isActive: 'boolean',
      sessionList: 'Array',
      notifications: [
        {
          channelId: 'number',
          dmId: 'number',
          notificationMessage: 'string'
        },
      ],
      userStats: {
        channelsJoined: [
          {
            numChannelsJoined: 'number',
            timeStamp: 'number'
          }
        ],
        dmsJoined: [
          {
            numDmsJoined: 'number',
            timeStamp: 'number'
          }
        ],
        messagesSent: [
          {
            numMessagesSent: 'number',
            timeStamp: 'number'
          }
        ],
        involvementRate: 'number'
      }
    }
  ],
  channels: [
    {
      channelId: 'number',
      name: 'string',
      ownerMembers: 'Array',
      allMembers: 'Array',
      isPublic: 'boolean',
      messages: [
        {
          messageId: 'number',
          uId: 'number',
          message: 'string',
          timeSent: 'number',
          reacts: [
            {
              reactId: 'number',
              uIds: 'Array',
              isThisUserReacted: 'boolean'
            },
          ],
          isPinned: 'boolean',
        }
      ],
      standup: {
        isActive: 'boolean',
        timeFinish: 'integer',
        creatorId: 'number',
        messagesQueue: [
          {
            handleStr: 'string',
            message: 'string'
          }
        ]
      },
    }
  ],
  dms: [
    {
      dmId: 'number',
      name: 'string',
      uIds: 'Array',
      creatorId: 'number',
      messages: [
        {
          messageId: 'number',
          uId: 'number',
          message: 'string',
          timeSent: 'number',
          reacts: [
            {
              reactId: 'number',
              uIds: 'Array',
              isThisUserReacted: 'boolean'
            },
          ],
          isPinned: 'boolean',
        },
      ],
    }
  ],
  passwordReset: [
    {
      email: 'string',
      resetCode: 'string',
    }
  ],
  workplaceStats: {
    channelsExist: [
      {
        numChannelsExist: 'number',
        timeStamp: 'number',
      }
    ],
    dmsExist: [
      {
        numDmsExist: 'number',
        timeStamp: 'number'
      }
    ],
    messagesExist: [
      {
        numMessagesExist: 'number',
        timeStamp: 'number'
      }
    ],
    utilizationRate: 'number'
  },
  messageId: 1,
  dmId: 1
};