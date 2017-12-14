import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  constructor(public afAuth: AngularFireAuth) {
  }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  signupUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword);
  }

  addProfileData(name: string) {
    return this.afAuth.authState.subscribe(user => {
      user.updateProfile({displayName: name, photoURL: null});
    });
  }

  getUserObj() : Observable<firebase.User> {
    return this.afAuth.authState;
  }
}
