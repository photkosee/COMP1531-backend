channelsCreateV1(authUserId, name, isPublic):
-when isPublic is not boolean, should return { eror: 'error' }.
-when authUserId is not valid, should return { eror: 'error' }.
-when creating a new channel but with the existing name, should be able to create a new one with smae name but different channelId.
channelsListV1(authUserId):
-when authUserId is not valid, should return { eror: 'error' }.
-return an empty array when the owner of authUserId is not in any channels.
channelsListallV1(authUserId):
-when authUserId is not valid, should return { eror: 'error' }.

