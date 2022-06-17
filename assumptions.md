channelsCreateV1(authUserId, name, isPublic):
-when isPublic is not a boolean, should return { eror: 'error' }.
-when authUserId is not valid, should return { eror: 'error' }.
-when creating a new channel but with the existing name, should be able to create a new one with smae name but different channelId.

channelsListV1(authUserId):
-when authUserId is not valid, should return { eror: 'error' }.
-return an empty array when the owner of authUserId is not in any channels.

channelsListallV1(authUserId):
-when authUserId is not valid, should return { eror: 'error' }.

channelDetailsV1(authUserId, channelId):
-when authUserId is not valid, should return { eror: 'error' }.

channelJoinV1(authUserId, channelId):
-when authUserId is not valid, should return { eror: 'error' }.

channelInviteV1(authUserId, channelId):
-when authUserId is not valid, should return { eror: 'error' }.

channelMessagesV1(authUserId, channelId, start):
-when authUserId is not valid, should return { eror: 'error' }.
-when start is not an integer, should return { eror: 'error' }.

userProfileV1(authUserId, ulId):
-when authUserId is not valid, should return { eror: 'error' }.
