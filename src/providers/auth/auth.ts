import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Storage } from '@ionic/storage';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider implements OnDestroy {

  authState: BehaviorSubject<firebase.User | null>;
  profile: BehaviorSubject<ProfileUid | null>; 
  communityId: BehaviorSubject<string | null>;

  private profileObservable: Observable<ProfileUid | null>; 

  constructor(public afAuth: AngularFireAuth, public afd:AngularFireDatabase, public storage: Storage) {
    this.authState = new BehaviorSubject(null);
    this.communityId = new BehaviorSubject(null);
    this.afAuth.authState.subscribe(this.authState);

    this.profileObservable = Observable.create((observer) => {
      let superadminSub: Subscription;
      let authSub: Subscription;
      let commSub: Subscription;

      authSub = this.authState.subscribe((auth) => {
        if (auth!=null) {
          let profileUid: ProfileUid = new ProfileUid;

          commSub = this.communityId.subscribe( id => {
            profileUid.community = id;
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
          if (superadminSub!=null) {
            superadminSub.unsubscribe();
          }
          if (commSub!=null) {
            commSub.unsubscribe();
          }
          observer.next(null);
        }
      });
      // Return Unsubscribe function
      return () => {
        authSub.unsubscribe();  
      }
    });
    this.profile = new BehaviorSubject(null);
    this.profileObservable.subscribe(this.profile);

    this.storage.get('communityId').then( id => {
       this.communityId.next(id);     
    });
  }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return new Promise( (response, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword).then( (userdata) => {
        this.storage.set('communityId', "");
        this.communityId.next("");
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
        this.storage.set('communityId', "");
        this.communityId.next("");
        response(userdata);   
      }, (error) => reject(error));
    });
  }

  addProfileData(name: string) {
    let authNow = this.authState.getValue();
    if (authNow == null) {
      let sub: Subscription = this.authState.subscribe(auth => {
        if (auth!=null) {
          auth.updateProfile({displayName: name, photoURL: null});
          sub.unsubscribe();
        }
      });
    }
    else 
    {
      authNow.updateProfile({displayName: name, photoURL: null});
    }
  }

  updateCommunity(communityId: string) {
    this.storage.set('communityId', communityId);
    this.communityId.next(communityId);
  }

  ngOnDestroy() {
  }
}

export class ProfileUid {
  uid: string = "";
  superadmin: boolean = false;
  community: string = "";
}