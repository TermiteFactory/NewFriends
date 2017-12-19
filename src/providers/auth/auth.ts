import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider implements OnDestroy {

  authState: Observable<firebase.User | null>;
  profile: Observable<Profile | null>; 

  constructor(public afAuth: AngularFireAuth, public afd:AngularFireDatabase) {
    this.authState = this.afAuth.authState;

    this.profile = Observable.create((observer) => {
      let profileSub: Subscription;
      let authSub: Subscription;

      authSub = this.afAuth.authState.subscribe((auth) => {
        if (auth!=null) {
          profileSub = this.afd.object<Profile>('/profiles/' + auth.uid).valueChanges().subscribe( (profiles) => {
            observer.next(profiles);
          });
        } else {
          observer.next(null);
          profileSub.unsubscribe();
        }
      });
      // Return Unsubscribe function
      return () => {
        authSub.unsubscribe();  
      }
    });
  }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return new Promise( (response, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword).then( (userdata) => {
        // hmm in the end there is nothing to do ...

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
        this.afd.object('/profiles/' + userdata.uid).set(new Profile);

        response(userdata);   
      }, (error) => reject(error));
    });
  }

  addProfileData(name: string) {
    let sub: Subscription = this.afAuth.authState.subscribe(auth => {
      auth.updateProfile({displayName: name, photoURL: null});
      sub.unsubscribe();
    });
  }

  ngOnDestroy() {
  }
}

export class Profile {
  community: string = "";
  superadmin: boolean = false;

  constructor() {
  }
}