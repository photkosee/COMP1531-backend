# Crunchie F09A Extra Features

We have implemented two new backend and frontend features in our repo's ‘iter3/bonus-feature’ branch. Our features are:
1. Google login
2. Send photos

Link to our backend bonus-feature branch: 
https://gitlab.cse.unsw.edu.au/COMP1531/22T2/groups/F09A_CRUNCHIE/project-backend/-/tree/iter3/bonus-feature

Link to the deployed frontend:
https://f09acrunchie.netlify.app/

Link to backend URL:
https://f09acrunchie.herokuapp.com/

Note: As our backend is hosted on Heroku free tier, the server cold starts and will take 20-30 seconds to boot upon receiving the first request. 

## **Google Login**
Allows users to log into Treats using their existing Google Account. Users can select the “Sign in with Google” option on the log-in page or use the One-Tap-Sign-In pop-up. A Treats account will be created upon their first successful Google log-in. Subsequent Google logins will log the user into their existing account. 

Google provides a token with the user’s data to be used in Treats. Creates a Treats account with the user's first name, last name, email and Google profile picture from the given token. 

This feature will make it easier for users to log in, and reduces the nuisance of remembering user names and passwords. 

### Libraries Used
jwt_decode library used to decode token to get user data from token received on successful google sign-in
https://www.npmjs.com/package/jwt-decode

### Script for Google Sign in
https://accounts.google.com/gsi/client

### Edited Files in Backend
src/auth.ts

Function: googleLoginV1

https://gitlab.cse.unsw.edu.au/COMP1531/22T2/groups/F09A_CRUNCHIE/project-backend/-/blob/iter3/bonus-feature/src/auth.ts

### Links to Edited Frontend Repo
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/pages/LoginPage.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/history.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/components/Layout/Header.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/client_secret_126247982712-65vd5fbsn0ld2m0689mevfpkpnkl7kf6.apps.googleusercontent.com.json
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/App.js

## **Send Photos**

Photo messages can be edited, pinned, reacted etc. as regular messages. 

If a sent photo is clicked, the photo is enlarged.

This allows users to send images and visual communication is enhanced. 

### Libraries Used
Multer library used to save uploaded images

https://www.npmjs.com/package/multer

### Edited Files in Backend
src/imageUploadHandler.ts

Function: sendImageV1

https://gitlab.cse.unsw.edu.au/COMP1531/22T2/groups/F09A_CRUNCHIE/project-backend/-/blob/iter3/bonus-feature/src/imageUploadHandler.ts

## Links to Edited Frontend Repo
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/components/Message/index.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/components/Message/ImagePreview.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/components/Message/SendImage.js
- https://gitlab.cse.unsw.edu.au/z5343320/project-frontend/-/blob/master/src/components/Message/AddMessage.js

