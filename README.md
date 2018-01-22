# NewFriends
An ionic2 application to share information about new friends in a church community
This application is developed for a specific purpose but can be customised (forked) to fit your requirement in your specific community. 

This application uses the Ionic2 application framework as well as the AngularFire2 backend interface library. The backend the application interfaces with is Firebase.

## Backend Setup

### Firebase Backend Connection
The installation requires a Firebase account to be installed. You need to obtain an API key from the account in order for the App to connect to the required database. 

This API key can be found in Settings > Project Settings > Add Firebase to your Web App

A file src/app/firebaseconfig.ts has to be created with the following content:
```Javascript
export const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: ""
};
```

### Firebase DB Rules
Firebase requires that rules be defined to premit certain access to the DB. 
(Note that this is still under development but the current prototype requires the following rules)

The rules shall be configured as such:
```
{
  "rules": {
    "communities": {
      ".write": "root.child('superadmin').child(auth.uid).val() == true",
      "$community": {
        "data": {
            ".read": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()",
            ".write": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()" 
          },
        "messages": {
            ".read": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()",
            ".write": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()" 
          },
        "name": {
            ".read": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()",
            ".write": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()" 
          },
        "notify": {
          	".read": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()",
            ".write": "true == root.child('communities').child($community).child('permissions').child(auth.uid).val()"  
          },
        "permissions": {
            ".write": "root.child('superadmin').child(auth.uid).val() == true", 
          }	        
      }
    },
    "communitiesinfo": {
      ".read": "auth != null",
      ".write": "root.child('superadmin').child(auth.uid).val() == true",
    	"$communityinfo": {
        "permissions": {
          ".read": "auth != null",
          ".write": "auth != null"   
        }
      }
    },
    "profiles": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "superadmin": {
      ".read": "auth != null"
    }
  }
}
```

### Initial Database 
The database requires an initial setup. So please update the db with the following json file found in InitialDatabase.json. 
You can do this from the firebase menu in real time database -> click on the options -> import json

### Firebase Authentication Settings
The application uses the email authentication settings
This needs to be enabled in Firebase before the application can work. 

Go to Authentication -> Signin Method and enable the Email/Password authentication settings.

After which you should go to the Templates method to customise the email templates your users will receive when they forget their password. Or are welcomed as a member. Or if you prefer them to validate their email, this is an option too. 

### Push Notifications
Push notifications require alot of configuration to set up. I followed this guide loosely to generate the certificates for IOS.

https://www.djamware.com/post/58a1378480aca7386754130a/ionic-2-fcm-push-notification

The steps are as follows:
1. Log in to your apple developer account and go to Account > Certificates Identifiers and Profiles
2. Click on iOS certificates and click on + button to add a certificate
3. Click on Apple Push Notifiation Service (Under Development). Later you need to repeat the process for production
4. Follow the instructions to generate a Certificate Signing Request 
5. Generate a certificate and download it
6. Repeat the steps for Production ceritificate
7. On a Mac OS, you can double click on each of the certificates and then export it as a p12 certificate
8. When prompted add a password to protect the certificate
9. Go to the Firebase and go to settings 
10. Click on Cloud Messaging and upload both the p12 APN certificates 

### Firebase Functions
For push notification to work, we need to set the firebase functions.

The steps can be found from the sample github:
https://github.com/firebase/functions-samples/tree/master/fcm-notifications

1. Create a Firebase Project using the Firebase Console.
2. Enable Google Provider in the Auth section
3. Clone or download this repo and open the fcm-notification directory.
4. You must have the Firebase CLI installed. If you don't have it install it with npm install -g firebase-tools and then 5. configure it with firebase login.
6. Configure the CLI locally by using firebase use --add and select your project in the list.
7. Install dependencies locally by running: cd functions; npm install; cd -
8. Deploy your project using firebase deploy
9. Open the app using firebase open hosting:site, this will open a browser.
10. Start following a user, this will send a notification to him.

The code can be found firebase firebase_functions/index.ts

## Building the App

### Install Pre Requisites
The source code provided here is based on node.js and ionic. Install node.js from https://nodejs.org and run the following to install ionic: https://ionicframework.com/docs/intro/installation/

### Clone process
To start the application, you have to first clone the git repository. 

In the directory run the following:
```
npm install
ionic serve
```

## Running the App
Once the application is running, a user needs to be registered. Users by default are not created with superadmin priviledges.

Upon initiation of the database, you will need to make 1 or more users a SuperAdmin so that he can:
1. Create communities
2. Approve members of a community 

Making someone SuperAdmin can only be done via the firebase console and cannot be done via the App.
To do so, you need to change the field found in the following path to 'true'

```
profiles/<profile uid>/superadmin
```

## Design Details 

### Database Schema 
The database schema created automatically is as follows. 

```
communities
    - <Community ID>
        - data
            - persons
                - <Person ID>
                    - details
                        ... (Contains details of the person)
                    - notes
                        - <Note ID>
                            - date
                            - name
                            - text
                            - uid : Unique Identifier of Profile
            - summary
                - <Summary ID>
                    - date: date of joining or addition 
                    - details_key: Value is the Person ID used by the persons list
                    - followup_id: the id of the newcomer to follow up 
                    - followup_name: the name displayed of the member following up
                    - assign_id: the person who assigned this newcomer to a member
                    - add_id: the id of the person added
                    ... (more details of the person)
        - name: Value is the name of this community
        - permissions
            - <Profile uid>: Value is true. This is set by the superadmin. Cannot be changed by anyone else
        - messages
            - sms: sms text
            - emailsubject: subject of the email
            - emailbody: body text of the email
        - notifytokens
            - <tokenid>: Value is true. tokens for sending push notifications when a new is added 
profiles
    - <Profile uid>
        - community: Value is the name of the community that has been joined (or "" if no joining)
        - superadmin: true if this is a super admin, or false otherwise.

communitiesinfo
    - <Community ID>
        - name: Name of the community
        - permissions
            - <Profile uid> 
                - auth: Value is Member/Pending/Removed
                - email: Value is the email of the person
                - name: value is the name of the person
                - notifytokens: 
                    - <tokenid> : Value is true. tokens for sending push notifications when a newcomer is added to your care

```

