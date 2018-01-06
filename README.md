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
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Firebase Authentication Settings
The application uses the email authentication settings
This needs to be enabled in Firebase before the application can work. 

Go to Authentication -> Signin Method and enable the Email/Password authentication settings.

After which you should go to the Templates method to customise the email templates your users will receive when they forget their password. Or are welcomed as a member. Or if you prefer them to validate their email, this is an option too. 

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

## Database Schema 
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
                    ... (more details of the person)
        - name: Value is the name of this community
        - permissions
            - <Profile uid> 
                - auth: Value is Member/Pending/Removed
                - email: Value is the email of the person
                - name: value is the name of the person
profiles
    - <Profile uid>
        - community: Value is the name of the community that has been joined (or "" if no joining)
        - superadmin: true if this is a super admin, or false otherwise.

```

