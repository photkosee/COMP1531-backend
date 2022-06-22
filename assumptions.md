As of Wednesday 22 June

**White Spaces**
- Passwords should not be only white spaces (e.g. "    ").

- Given password, nameFirst, nameLast, and email for authRegisterV1, white 
spaces on either ends will be trimmed (e.g. "  Pete   " becomes "Pete"). 

- For authLoginV1, white spaces on either ends will be trimmed for email but 
not password.

**Non-existent Channels**
- For channelsListallV1 and channelsListV1, an invalid authUserId will return 
{ error: 'error' }.

- For channelsListV1, if a valid authUserId is not a member of any channel, 
function it will return { channels: [] }.

- For channelsListallV1, if there are no existing channels, function will return 
{ channels: [] }.

**Negative Start Numbers**
- For channelMessagesV1, negative start numbers will return { error: 'error' }

**authUserId Validity in userProfileV1**
- Return { error: 'error' } if authUserId is invalid. 

**Invites**
- Any user can be invited via channelInviteV1

**Adding Owners**
- The only owner for each channel is the user who created the channel 
throughout the running of the program (as owners cannot be added in Iteration1). 
channelJoinV1 will only add users to allMembers[]. 

**Name Valid Characters**
- For authRegisterV1, multiple users can have the same nameFirst and nameLast. 
The same user can have the same nameFist and nameLast.

- nameFast and nameLast can only contain [a-z], [A-Z] and white spaces within
(i.e. "Jaci nta" is valid. "   Jacinta" is not valid). 
Special characters and numbers are not valid. 

**Active Parameter**
- 'active' parameter in authLoginV1 will return 'true' if account is abled. 
Will return 'false' if account is disabled and user is prevented from logging in. 
