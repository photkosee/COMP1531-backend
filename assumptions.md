As of Wednesday 22 June

//////////////////// MARKED ASSUMPTIONS /////////////////////////
Note: At the time of writing out assumptions (Friday 24th June 10:51am, 
there are no pinned posts about authUserId and thus, we have made our own 
assumptions)

- Passwords should not be only white spaces (e.g. "    "). 
This will return { errpr: 'error' }.

- Given password, nameFirst, nameLast, and email for authRegisterV1, white 
spaces on either ends will be trimmed (e.g. "  Pete   " becomes "Pete"). For 
authLoginV1, white spaces on either ends will be trimmed for email but 
not password.

- For channelsListallV1, if there are no existing channels, function will return 
{ channels: [] }.

- For channelsListallV1, if there are no existing channels, function will return 
{ channels: [] }.

- For channelMessagesV1, negative start numbers will return { error: 'error' }

- If authUserId is invalid (for any function), it will return { error: 'error' }

//////////////////// EXTRA ASSUMPTIONS //////////////////////////

**White Spaces**
- Passwords should not be only white spaces (e.g. "    "). 
This will return { errpr: 'error' }.

- Given password, nameFirst, nameLast, and email for authRegisterV1, white 
spaces on either ends will be trimmed (e.g. "  Pete   " becomes "Pete"). 

- For authLoginV1, white spaces on either ends will be trimmed for email but 
not password.

**Non-existent Channels**

- !For channelsListV1, if a valid authUserId is not a member of any channel, 
function it will return { channels: [] }.

- !For channelsListallV1, if there are no existing channels, function will return 
{ channels: [] }.

**Negative Start Numbers**
- For channelMessagesV1, negative start numbers will return { error: 'error' }

**AuthUserId**
- If authUserId is invalid (for any function), it will return { error: 'error' }

**Invites**
- Any user can be invited via channelInviteV1

**Adding Owners**
- The only owner for each channel is the user who created the channel and 
the global owner throughout the running of the program (as owners cannot be 
added in Iteration1). 
channelJoinV1 will only add users to allMembers[]. 

**Name Valid Characters**
- For authRegisterV1, multiple users can have the same nameFirst and nameLast. 
The same user can have the same nameFist and nameLast.