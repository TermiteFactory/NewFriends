import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider implements OnDestroy {

  authState: BehaviorSubject<firebase.User | null>;
  profile: BehaviorSubject<ProfileUid | null>; 

  private profileObservable: Observable<ProfileUid | null>; 

  constructor(public afAuth: AngularFireAuth, public afd:AngularFireDatabase) {
    this.authState = new BehaviorSubject(null);
    this.afAuth.authState.subscribe(this.authState);

    this.profileObservable = Observable.create((observer) => {
      let profileSub: Subscription;
      let superadminSub: Subscription;
      let authSub: Subscription;

      authSub = this.afAuth.authState.subscribe((auth) => {
        if (auth!=null) {
          let profileUid: ProfileUid = new ProfileUid;
          
          profileSub = this.afd.object<Profile>('/profiles/' + auth.uid).valueChanges().subscribe( (profile) => {
            profileUid.assign(profile);
            profileUid.uid = auth.uid;
            observer.next(profileUid);
          });

          superadminSub = this.afd.object<boolean>('/superadmin/' + auth.uid).valueChanges().subscribe( (superadmin) => {
            if (superadmin == true) {
              profileUid.superadmin = true;
            } else {
              profileUid.superadmin = false;
            }
            if (profileUid.uid!="") {
              observer.next(profileUid);
            }
          });

        } else {
          observer.next(null);
          
          if (profileSub!=null) {
            profileSub.unsubscribe();
          }
          if (superadminSub!=null) {
            superadminSub.unsubscribe();
          }
        }
      });
      // Return Unsubscribe function
      return () => {
        authSub.unsubscribe();  
      }
    });
    this.profile = new BehaviorSubject(null);
    this.profileObservable.subscribe(this.profile);
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

  updateCommunity(communityId: string, uid: string) {
    this.afd.object<Profile>('/profiles/' + uid).update({community: communityId});
  }

  ngOnDestroy() {
  }
}

export class Profile {
  community: string = "";

  constructor() {
  }
}

export class ProfileUid extends Profile {
  uid: string = "";
  superadmin: boolean = false;

  assign(superClass: Profile) {
    this.community = superClass.community;
  }

  constructor() {
    super();
  }
}