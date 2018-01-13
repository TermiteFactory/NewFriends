import { Injectable } from '@angular/core';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { FCM } from '@ionic-native/fcm';

/*
  Generated class for the MatchstickDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MatchstickDbProvider implements OnDestroy {
  
  communityState: BehaviorSubject<JoinData | null>;

  private communityStateObservable: Observable<JoinData | null>
  private profileSub: Subscription;
  private token: string;

  constructor(public authData: AuthProvider, public afd:AngularFireDatabase, private fcm: FCM) {
    
    this.addUidToPermissions();
    
    this.communityStateObservable = Observable.create( (observer) => {
      let stateSub: Subscription = null;
      let nameSub: Subscription = null;
      
      let profileUidSub: Subscription = this.authData.profile.subscribe( (profileUid) => {
        if (stateSub != null) {
          stateSub.unsubscribe();
        }
        if (nameSub != null) {
          nameSub.unsubscribe();
        }
        if (profileUid == null || profileUid.community == "") {
          observer.next(null);
        }
        else {
          let currentData: JoinData = new JoinData;
          nameSub = this.afd.object<string>('/communities/' + profileUid.community + '/name').valueChanges().subscribe( (name) => {
            currentData.communityName = name;
            currentData.communityId = profileUid.community;
            if (currentData.joinState != "Invalid") {
              observer.next(currentData);
            }
          });
          stateSub = this.afd.object<Permission>('/communities/' + profileUid.community + '/permissions/' + profileUid.uid).valueChanges().subscribe( (state) => {
            if (state!=null) {
              currentData.joinState = state.auth;
              if (currentData.communityName != "Invalid" && currentData.communityId != "Invalid" ) {
                observer.next(currentData);
              }
            }
          }); 
        }
      });
      return () => {
        profileUidSub.unsubscribe();
      };
    });

    this.communityState = new BehaviorSubject(null);
    this.communityStateObservable.subscribe(this.communityState);

    // Get the current token
    
    fcm.onTokenRefresh().subscribe(token=>{
      this.token = token;
    }, error => {
      this.token = '1234567';
    })
  }

  // Listens to the change in profiles and will add the uid to the community when necessary 
  addUidToPermissions() {
    this.profileSub = this.authData.profile.subscribe( (profileUid) => {
      // if this is null it means we are logged out
      if (profileUid!=null) {
        if (profileUid.community != "") {
          let permissionSub: Subscription = this.afd.object('/communities/' + profileUid.community + '/permissions/').valueChanges().subscribe( (state) => {
            if (state != null) {
              if (state == 0 || !(profileUid.uid in state)) {
                let permission = new Permission;
                let userdata = this.authData.authState.getValue();
                permission.email = userdata.email;
                permission.name = userdata.displayName;
                this.afd.object('/communities/' + profileUid.community + '/permissions/' + profileUid.uid).set(permission);
              }
              permissionSub.unsubscribe();      
            }
          }); 
        }
      }
    });
  }

  private getPermissionsLisRef(communityId: string): AngularFireList<any> | null {
    return this.afd.list('/communities/' + communityId + '/permissions/');
  }

  private getPersonListRef(communityId: string): AngularFireList<any> | null {
    return this.afd.list('/communities/' + communityId + '/data/persons');
  }

  private getSummaryListRef(communityId: string): AngularFireList<any> {
    return this.afd.list('/communities/' + communityId + '/data/summary');
  }

  private getPersonRef(detailedKey: string, communityId: string): AngularFireObject<any> {
    return this.afd.object('/communities/' + communityId + '/data/persons/' + detailedKey);
  }

  private getPersonDetailsRef(detailedKey: string, communityId: string): AngularFireObject<any> {
    return this.afd.object('/communities/' + communityId + '/data/persons/' + detailedKey + '/details');
  }

  private getSummaryRef(summaryKey: string, communityId: string): AngularFireObject<any> {
    return this.afd.object('/communities/' + communityId + '/data/summary/' + summaryKey);
  }
  
  private getPersonNotesRef(detailedKey: string, communityId: string): AngularFireList<any> {
    return this.afd.list('/communities/' + communityId + '/data/persons/' + detailedKey + '/notes')
  }

  private getPersonSingleNoteRef(detailedKey: string, communityId: string, noteId: string): AngularFireObject<any> {
    return this.afd.object('/communities/' + communityId + '/data/persons/' + detailedKey + '/notes/' + noteId);
  }

  updateNotifyNew(notify: boolean) {
    let joinState = this.communityState.getValue();
    if (notify==true) {
      this.afd.object('/communities/' + joinState.communityId + '/notifytokens/'+ this.token).set(true);
    }
    else {
      this.afd.object('/communities/' + joinState.communityId + '/notifytokens/'+ this.token).remove();
    }
  }

  updateNotifyAssigned(notify: boolean) {
    let joinState = this.communityState.getValue();
    let profileuid = this.authData.profile.getValue();
    if (notify==true) {
      this.afd.object('/communities/' + joinState.communityId + '/permissions/'+ profileuid.uid + '/notifytokens/' + this.token).set(true);
    }
    else {
      this.afd.object('/communities/' + joinState.communityId + '/permissions/'+ profileuid.uid + '/notifytokens/' + this.token).remove();
    }
  }

  updateAssignment(summaryKey: string, followup_id: string, followup_name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getSummaryRef(summaryKey, joinState.communityId).update({followup_id: followup_id, followup_name: followup_name}).then( () => {
        resolve();
      }, () => reject);
    });
  }

  updatePermission(permissionKey: string, authState: string) {
    let joinState = this.communityState.getValue();
    this.afd.object('/communities/' + joinState.communityId + '/permissions/' + permissionKey).update({auth: authState});
  }

  updateData( detailedKey: string, summaryKey: string, data: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getPersonDetailsRef(detailedKey, joinState.communityId).update(data).then(() => {
        let summarydata = new SummaryData;
        this.copyToSummary(data, summarydata);
        this.getSummaryRef(summaryKey, joinState.communityId).update(summarydata).then( () => {
          resolve();
        }, () => reject);
      }, () => reject);    
    });    
  }
  
  addNote(detailedKey: string, comment: string, date: string) {
    let joinState = this.communityState.getValue();
    let auth = this.authData.authState.getValue();
    let note = new Note;
    note.date = date;
    note.name = auth.displayName;
    note.text = comment;
    note.uid = auth.uid;
    this.getPersonNotesRef(detailedKey, joinState.communityId).push(note);
  }

  addData(detailData: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      let person = new Person;
      person.details = detailData;
      this.getPersonListRef(joinState.communityId).push(person).then( pushRtn => {
        let summary = new SummaryDataKey;
        this.copyToSummary(detailData, summary);
        summary.details_key = pushRtn.key;
        this.getSummaryListRef(joinState.communityId).push(summary).then( () => {
          resolve();
        }, () => reject() );
      }, () => reject() );
    });
  }

  deleteData( detailedKey: string, summaryKey: string) : Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getPersonRef(detailedKey, joinState.communityId).remove().then ( () => {
        this.getSummaryRef(summaryKey, joinState.communityId).remove().then ( () => {
          resolve();
        }, () => reject() );
      }, () => reject() );
    });
  }

  copyToSummary (from: DetailedData, to: SummaryData)  {
    to.date = from.dateVisited;
    to.name = from.name;
    to.tag_alpha = from.tag_alpha;
    to.tag_connect = from.tag_connect;
    to.tag_churchschool = from.tag_churchschool;
    to.tag_yam = from.tag_yam;
    to.tag_cvl = from.tag_cvl;
    to.tag_pastor = from.tag_pastor;
    to.tag_nocontact = from.tag_nocontact;
    to.email = from.email;
    to.phone = from.phone;
  }

  getPermissionsList(): Observable<any[]> {
    return Observable.create( (observer) => {
      let permSub: Subscription = null;
      let commSub: Subscription = this.communityState.subscribe( (state) => {
        if (state!=null) {
          permSub = this.getPermissionsLisRef(state.communityId).snapshotChanges().map(changes => {
            return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
          }).subscribe( (list) => {
            observer.next(list);
          });
        } else {
          if (permSub!=null) {
            permSub.unsubscribe();
          }
          observer.next([]);
        }
      });
      // Return Unsubscribe function
      return () => {
        if (permSub!=null) {
          permSub.unsubscribe();
        }
        commSub.unsubscribe();
      }
    });
  }

  getSummaryList(queryFn?: QueryFn): Observable<any[]> {
    return Observable.create( (observer) => {
      let sumSub: Subscription = null;
      let commSub: Subscription = this.communityState.subscribe( (state) => {
        if (state!=null && state.joinState=="Member") {
          sumSub = this.afd.list('/communities/' + state.communityId + '/data/summary', queryFn).snapshotChanges().map(changes => {
            return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
          }).subscribe( (list) => {
            observer.next(list);
          });
        } else {
          if (sumSub!=null) {
            sumSub.unsubscribe();
          }
          observer.next([]);
        }
      });
      // Return Unsubscribe function
      return () => {
        if (sumSub!=null) {
          sumSub.unsubscribe();
        }
        commSub.unsubscribe();
      }
    });
  }

  getDetailed(detailedKey: string) : Observable<any> {
    return Observable.create( (observer) => {
      let joinState = this.communityState.getValue();
      // Register for the detailed state to get updates
      let detailedSub = this.getPersonDetailsRef(detailedKey, joinState.communityId).valueChanges().subscribe( (detailed) => {
        observer.next(detailed);
      });        
      // Unsubscribe callback
      return () => {
        if (detailedSub!=null) {
          detailedSub.unsubscribe();
        } 
      }
    });
  }

  getNotes(detailedKey: string) : Observable<any[]> {
    return Observable.create( (observer) => {
      let joinState = this.communityState.getValue();
      let notesSub = this.getPersonNotesRef(detailedKey, joinState.communityId).snapshotChanges().map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      }).subscribe( (notes) => {
        observer.next(notes);
      });
      // Unsubscribe callback
      return () => {
        if (notesSub!=null) {
          notesSub.unsubscribe();
        } 
      }
    });
  }

  addCommunity(name: string) {
    let community = new Community;
    community.name = name;
    community.permissions = 0;
    this.afd.list('/communities').push(community);
  }

  getCommunityList(): Observable<any[]>  {
    return this.afd.list('/communities').snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  setCommmunity(communityId: string) {
    let user = this.authData.authState.getValue();
    
    // user should not be null at this point!
    this.authData.updateCommunity(communityId, user.uid);
  }

  modifyNote(detailedKey: string, text: string, noteId: string): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getPersonSingleNoteRef(detailedKey, joinState.communityId, noteId).update({text: text}).then( 
        ()=> resolve(), ()=> reject());
    });
  }

  deleteNote(detailedKey: string, noteId: string): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getPersonSingleNoteRef(detailedKey, joinState.communityId, noteId).remove().then( 
        ()=> resolve(), ()=> reject());
    });
  }

  ngOnDestroy() {
    this.profileSub.unsubscribe();
  }
  
}

export class Permission {
  auth: string = "Pending";
  name: string = "";
  email: string = "";
}

export class JoinData {
  communityId: string = "Invalid";
  communityName: string = "Invalid";
  joinState: string = "Invalid";
}

export class Community {
  name: string = "";
  permissions: 0;
  data: { summary: 0, persons: 0};
}

export class SummaryData {
  date: string = "";
  name: string = "";
  tag_alpha: boolean = false;
  tag_connect: boolean = false;
  tag_churchschool: boolean = false;
  tag_yam: boolean = false;
  tag_cvl: boolean = false;
  tag_pastor: boolean = false;
  tag_nocontact: boolean = false;
  email: string = "";
  phone: string = "";

  constructor() {
  }
}

export class Note {
  name: string = "";
  date: string = "";
  text: string = "";
  uid: string = "";

  constructor() {
  }
}

export class SummaryDataKey extends SummaryData {
  details_key: string = "";
  followup_name: string = "";
  followup_id: string = "";  

  constructor() {
    super();
  }
}

export class Person {
  details: DetailedData = new DetailedData;
  notes: 0;
  
  constructor() {
  }
}

export class DetailedData {
  dateVisited: string = "";
  name : string = "";
  cameWith : string = "";
  age: string = "";
  phone: string = "";
  email: string = "";
  religion: string = "";
  purpose: string = "";
  visitedBefore: string = "";
  tag_alpha: boolean = false;
  tag_connect: boolean = false;
  tag_churchschool: boolean = false;
  tag_yam: boolean = false;
  tag_cvl: boolean = false;
  tag_pastor: boolean = false;
  tag_nocontact: boolean = false;

  constructor() {
  }
}
