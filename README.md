# NewFriends
An ionic2 application to share information about new friends in a church community

This application is developed for a specific purpose but can be customised to fit your requirement in your specific community. 

## Installation Instructions

### Firebase Backend
The installation requires a Firebase account to be installed. You need to obtain an API key from the account in order for the App to connect to the required database. 

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



