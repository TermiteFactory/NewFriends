# NewFriends
An ionic2 application to share information about new friends in a church community

This application is developed for a specific purpose but can be customised to fit your requirement in your specific community. 

## Installation Instructions

### Firebase Backend
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

### Pre Requisites
The source code provided here is based on node.js and ionic. Install node.js from https://nodejs.org and run the following to install ionic: https://ionicframework.com/docs/intro/installation/

### Clone process
To start the application, you have to first clone the git repository. 

In the directory run the following:
```
npm install
ionic serve
```

## Database Schema 
The database schema created automatically is as follows. Upon initiation of the database, you will need to make 1 or more users a SuperAdmin so that he can:
1. Create communities
2. Approve members of a community 

Making someone SuperAdmin can only be done via the firebase console and cannot be done via the App.

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
            - <Profile uid> : Value is Member/Pending/Removed
profiles
    - <Profile uid>
        - community: Value is the name of the community that has been joined (or "" if no joining)
        - superadmin: true if this is a super admin, or false otherwise.

```

