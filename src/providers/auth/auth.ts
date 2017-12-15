import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  name: string;
  uid: string;
  community: string; 

  constructor(public afAuth: AngularFireAuth, public afd:AngularFireDatabase) {
  }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return new Promise( (response, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword).then( (userdata) => {
        this.getProfileData();
        this.afd.object('/profiles/' + userdata.uid).valueChanges().subscribe( (profile) => {
          this.community = profile.community;    
        });

        response(userdata);   
      }, (error) => reject(error));
    });
  }

  resetPassword(email: string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  signupUser(newEmail: string, newPassword: string, username: string): Promise<any> {
    return new Promise( (response, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword).then( (userdata) => {
        this.addProfileData(username);
        this.name = username;
        this.uid = userdata.uid;
        this.afd.list('/profiles').push({community: ""});

        response(userdata);   
      }, (error) => reject(error));
    });
  }

  addProfileData(name: string) {
    return this.afAuth.authState.subscribe(auth => {
      auth.updateProfile({displayName: name, photoURL: null});
    });
  }

  getProfileData() {
    return this.afAuth.authState.subscribe(auth => {
      this.name = auth.displayName;
    });
  }

  getUserObj() : Observable<firebase.User> {
    return this.afAuth.authState;
  }
}
