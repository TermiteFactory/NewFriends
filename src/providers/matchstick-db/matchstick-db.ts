import { Injectable } from '@angular/core';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { FCM } from '@ionic-native/fcm';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Storage } from '@ionic/storage';
import { Platform, AlertController } from 'ionic-angular';
import { auth } from 'firebase/app';

/*
  Generated class for the MatchstickDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MatchstickDbProvider implements OnDestroy {
  
  communityState: BehaviorSubject<JoinData | null>; // Give details of the community state
  newcomerNotify: BehaviorSubject<boolean>;
  newcomerAssigned: BehaviorSubject<boolean>;
  validAuth: BehaviorSubject<boolean>;

  private profileSub1: Subscription;
  private profileSub2: Subscription;
  private stateSub: Subscription;
  private nameSub: Subscription;
  private tokenSub: Subscription;
  private notifySub: Subscription;
  private token: string;

  constructor(public authData: AuthProvider, public afd:AngularFireDatabase, private fcm: FCM, 
    private localNotifications: LocalNotifications, private storage: Storage, private alertCtrl: AlertController,
    public plt: Platform) {
    
    this.addUidToPermissions();
    
    this.stateSub = null;
    this.nameSub = null;
    this.communityState = new BehaviorSubject(null);

    this.validAuth = new BehaviorSubject(false);
    authData.authState.subscribe( (state) => {
      if (state!=null) {
        this.validAuth.next(true);
      }
    });
    
    this.profileSub1 = this.authData.profile.subscribe( (profileUid) => {
      // Update the notifications table when profile changes
      this.checkUpdateNotifications();

      if (this.stateSub != null) {
        this.stateSub.unsubscribe();
      }
      if (this.nameSub != null) {
        this.nameSub.unsubscribe();
      }
      if (profileUid == null || profileUid.community == "") {
        this.communityState.next(null);
      }
      else {
        let currentData: JoinData = new JoinData;
        this.nameSub = this.afd.object<string>('/communitiesinfo/' + profileUid.community + '/name').valueChanges().subscribe( (name) => {
          currentData.communityName = name;
          currentData.communityId = profileUid.community;
          if (currentData.joinState != "Invalid") {
            this.communityState.next(currentData);
          }
        });
        this.stateSub = this.afd.object<Permission>('/communitiesinfo/' + profileUid.community + '/permissions/' + profileUid.uid).valueChanges().subscribe( (state) => {
          if (state!=null) {
            currentData.joinState = state.auth;
            if (currentData.communityName != "Invalid" && currentData.communityId != "Invalid" ) {
              this.communityState.next(currentData);
            }
          }
        }); 
      }
    });

    // Handle the case where the token can change after an OS upgrade
    // Just set the DB on change as there is no change in behavior subject
    this.tokenSub = this.fcm.onTokenRefresh().subscribe( () => {
      this.updateToken(); // Refresh the token again
    }, error => {});

    // Only when platform is ready
    plt.ready().then( () => {
      console.log('Platform is ready. Starting to subscribe for notifications');

      // Obtain the token upon startup
      this.updateToken();

      // Register for notification callback
      this.notifySub = fcm.onNotification().subscribe( data => {
        console.log('onNotification Callback');
        if (data.wasTapped) {
          //Notification was received on device tray and tapped by the user.
        } else {
          //Notification was received in foreground. Maybe the user needs to be notified.
          if (data.adderId != this.authData.profile.getValue().uid) {
            this.localNotifications.schedule({
              title: data.titleData,
              text: data.bodyData,
            });
          }
        }
      }, error => {
        console.log('onNotification Error');
      });
    });
  }

  updateToken() {
    // Get the current token
    this.fcm.getToken().then( token => {
      this.token = token;
      this.writeToken(token);
    }).catch( () => {
      this.token = '1234567';
      this.writeToken('1234567');
    });
  }

  writeToken(token: string) {
    let profileuid = this.authData.profile.getValue();
    if (profileuid!=null) {
      this.afd.object('/notifications/' + profileuid.uid + '/' + '/notifytokens/'+ token).set(true);
    }
    else {
      let sub = this.authData.profile.subscribe( profileuid => {
        if (profileuid!=null) {
          this.afd.object('/notifications/' + profileuid.uid + '/' + '/notifytokens/'+ token).set(true);
          sub.unsubscribe();
        }
      });
    }
  }

  checkUpdateNotifications() {
    let profileuid = this.authData.profile.getValue();
    if (profileuid!=null) {
      this.getGroupsConfig().subscribe(grps => {
        let memberSub = this.getMembershipList().subscribe( memberlist => {
          let commNotSub = this.afd.object('/notifications/' + profileuid.uid + '/configuration/').valueChanges().subscribe(conf => {
            // For each community that you are member of, ensure that you have something there!   
            memberlist.forEach(membership => {
              if (membership.membership=='Member' && (conf==undefined || conf == null || conf[membership.community_id] == undefined)) {
                let conf = new NotifyCommunityConf();
                conf.name = membership.community_name;
                this.afd.object<NotifyCommunityConf>('/notifications/' + profileuid.uid + '/configuration/' + membership.community_id).set(conf);
                grps.forEach(g => {
                  this.afd.object('/notifications/' + profileuid.uid + '/configuration/' + membership.community_id + '/group_notify/' + g.key).set(false);
                });
              }
            });
            // For reach community that you are not a member of, please remove!
            if (conf!=null || conf!=undefined) {
              let properties = Object.getOwnPropertyNames(conf);
              properties.forEach( prop => {
                let found = false;
                memberlist.forEach(mem => {
                  if (mem.community_id==prop && mem.membership=='Member') {
                    found = true;
                  }
                })
                if (found==false) {
                  this.afd.object<NotifyCommunityConf>('/notifications/' + profileuid.uid + '/configuration/' + prop).remove();
                }
              }); 
            }
            commNotSub.unsubscribe();
          });
        });
      });
    }
  }

  pendingSignout() {
    this.validAuth.next(false);
  }

  // Listens to the change in profiles and will add the uid to the community when necessary 
  addUidToPermissions() {
    this.profileSub2 = this.authData.profile.subscribe( (profileUid) => {
      // if this is null it means we are logged out
      if (profileUid!=null) {
        if (profileUid.community != "") {
          let permissionSub: Subscription = this.afd.object('/communitiesinfo/' + profileUid.community + '/permissions/').valueChanges().subscribe( (state) => {
            if (state!=null && (state == 0 || !(profileUid.uid in state))) {
              let permission = new Permission;
              let userdata = this.authData.authState.getValue();
              permission.email = userdata.email;
              permission.name = userdata.displayName;
              this.afd.object('/communitiesinfo/' + profileUid.community + '/permissions/' + profileUid.uid).set(permission);
            } 
            if (state!=null) {
              permissionSub.unsubscribe();      
            }
          }); 
        }
      }
    });
  }

  private getPermissionsLisRef(communityId: string): AngularFireList<any> | null {
    return this.afd.list('/communitiesinfo/' + communityId + '/permissions/');
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

  private getFollowupConfigRef(queryFn?: QueryFn): AngularFireList<FollowConfig> {
    return this.afd.list('/configuration/followup', queryFn);
  }

  private getGroupsConfigRef(queryFn?: QueryFn): AngularFireList<FollowConfig> {
    return this.afd.list('/configuration/groups', queryFn);
  }

  getFollowupConfig(): Observable<FollowConfig[]> {
    return this.getFollowupConfigRef(ref=>ref.orderByChild("id")).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  getGroupsConfig(): Observable<GroupConfig[]> {
    return this.getGroupsConfigRef(ref=>ref.orderByChild("id")).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  getEmailSubject(): Observable<string> {
    return this.afd.object<string>('/communities/' + this.communityState.getValue().communityId + '/messages/emailsubject').valueChanges();
  }

  getEmailBody(): Observable<string> {
    return this.afd.object<string>('/communities/' + this.communityState.getValue().communityId + '/messages/emailbody').valueChanges();
  }

  getSmsString(): Observable<string> {
    return this.afd.object<string>('/communities/' + this.communityState.getValue().communityId + '/messages/sms').valueChanges();
  }


  updateAssignment(summaryKey: string, followup_id: string, followup_name: string, assign_id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let joinState = this.communityState.getValue();
      let date_today = '';
      if (followup_id != '') {
        date_today = this.getDateToday();
      }
      this.getSummaryRef(summaryKey, joinState.communityId).update({followup_id: followup_id, followup_name: followup_name, assign_id: assign_id, assign_date: date_today}).then( () => {
        resolve();
      }, () => reject);
    });
  }

  updateFollowupStatus(summaryKey: string, followup_status: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let joinState = this.communityState.getValue();
      this.getSummaryRef(summaryKey, joinState.communityId).update({followup_state: followup_status}).then( () => {
        resolve();
      }, () => reject);
    });
  }

  updatePermission(permissionKey: string, authState: string) {
    let joinState = this.communityState.getValue();
    if (authState == "Member") {
      this.afd.object('/communities/' + joinState.communityId + '/permissions/' + permissionKey).set(true);
    }
    this.afd.object('/communitiesinfo/' + joinState.communityId + '/permissions/' + permissionKey).update({auth: authState}).then(() => {
      if (authState != "Member") {
        this.afd.object('/communities/' + joinState.communityId + '/permissions/' + permissionKey).remove();
      }
    });
  }

  updateData( detailedKey: string, summaryKey: string, data: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      let sub = this.getSummaryRef(summaryKey, joinState.communityId).valueChanges().subscribe( curr_summ_data => {
        sub.unsubscribe();
        if (curr_summ_data != null) {
          this.getPersonDetailsRef(detailedKey, joinState.communityId).update(data).then(() => {
            let summarydata = new SummaryData;
            this.copyToSummary(data, summarydata);
            this.getSummaryRef(summaryKey, joinState.communityId).update(summarydata).then( () => {
              resolve();
            }, () => reject);
          }, () => reject);  
        } else {
          let alert = this.alertCtrl.create({
            title: 'Edit Failed',
            subTitle: 'Person has been removed from the database',
            buttons: ['Dismiss']
          });
          reject();
          alert.present();
        }
      });  
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

  getDateToday() {
    function pad(datenum: Number) {
      let datestring : String;
      datestring = datenum.toString();
      if (datestring.length == 2) {
        return datestring;
      }
      else {
        return '0' + datestring;
      }
    }
    let today = new Date;
    return today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  }

  addData(detailData: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      let joinState = this.communityState.getValue();
      let person = new Person;
      person.details = detailData;
      this.getPersonListRef(joinState.communityId).push(person).then( pushRtn => {
        let summary = new SummaryDataKey;
        this.copyToSummary(detailData, summary);
        summary.add_id = this.authData.profile.getValue().uid;
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
    to.email = from.email;
    to.phone = from.phone;
    to.description = from.description;
    to.groups = from.groups;
  }

  getMembershipList(): Observable<Membership[]> {
    return Observable.create( (observer) => {
      let communitySub = this.afd.list('/communitiesinfo/').snapshotChanges().map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      }).subscribe( (list) => {
        let profile = this.authData.profile.getValue();
        let memberlist: Membership[] = [];
        list.forEach( element => {
          if (element.permissions[profile.uid]!=undefined) {
            let member = new Membership;
            member.community_id = element.key;
            member.community_name = element.name;
            member.membership = element.permissions[profile.uid].auth;
            memberlist.push(member);
          } 
        });
        observer.next(memberlist);
      });
      // Return Unsubscribe function
      return () => {
        communitySub.unsubscribe();
      }
    });
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

  updateNewcomerNotify(communityId: string, value: boolean) {
    let profileuid = this.authData.profile.getValue();
    this.afd.object('/notifications/' + profileuid.uid + '/configuration/' + communityId + '/newcomer_notify').set(value);
  }

  updateAssignNotify(communityId: string, value: boolean) {
    let profileuid = this.authData.profile.getValue();
    this.afd.object('/notifications/' + profileuid.uid + '/configuration/' + communityId + '/assignment_notify').set(value);
  }

  updateGroupNotify(communityId: string, groupKey: string, value: boolean) {
    let profileuid = this.authData.profile.getValue();
    this.afd.object('/notifications/' + profileuid.uid + '/configuration/' + communityId + '/group_notify/' + groupKey).set(value);
  }

  getNotificationSettings() : Observable<NotifyCommunityConfKey[]> {
    return Observable.create( (observer) => {
      let profileuid = this.authData.profile.getValue();
      let notifySub = this.afd.list<NotifyCommunityConf>('/notifications/' + profileuid.uid + '/configuration/').snapshotChanges().map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
      }).subscribe( (list) => {
        observer.next(list);
      });
      // Return Unsubscribe function
      return () => {
        if (notifySub!=null) {
          notifySub.unsubscribe();
        }
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

  getSummary(summaryKey: string) : Observable<any> {
    return Observable.create( (observer) => {
      let joinState = this.communityState.getValue();
      // Register for the detailed state to get updates
      let summarySub = this.getSummaryRef(summaryKey, joinState.communityId).valueChanges().subscribe( (summary) => {
        observer.next(summary);
      });        
      // Unsubscribe callback
      return () => {
        if (summarySub!=null) {
          summarySub.unsubscribe();
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
    this.afd.list('/communities').push(community).then( data => {
      this.afd.object('/communitiesinfo/' + data.key).set({name: name});
    });
  }

  getCommunityList(): Observable<any[]>  {
    return this.afd.list('/communitiesinfo').snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  setCommmunity(communityId: string) {
    this.authData.updateCommunity(communityId);
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
    this.profileSub1.unsubscribe();
    this.profileSub2.unsubscribe();
    this.tokenSub.unsubscribe();
    if (this.stateSub != null) {
      this.stateSub.unsubscribe();
    }
    if (this.nameSub != null) {
      this.nameSub.unsubscribe();
    }
    if (this.notifySub != null) {
      this.notifySub.unsubscribe();
    }
  }
}

export class NotifyCommunityConf {
  newcomer_notify: boolean = true;
  assignment_notify: boolean = true;
  group_notify: any = {}; // group_id: true/false
  name: string = "";
}

export class NotifyCommunityConfKey extends NotifyCommunityConf{
  key: string = "";
}

export class Membership {
  community_id: string = "";
  community_name: string = "";
  membership: string = "";
}

export class FollowConfig {
  default: boolean = false;
  desc: string = "";
  icon: string = "";
  id: number = 0;
  key: string = "";
}

export class GroupConfig {
  desc: string = "";
  id: number = 0;
  key: string = "";
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
  permissions = 0;
  data = { summary: 0, persons: 0};
  messages = { emailbody: "<p>Hi {personname},</p><p>This is {myname} from XXXX. It was nice meeting you! Do let me know if you like to know more about our church. God Bless and see you soon!</p><p>&nbsp;</p><p>Blessings,<br>{myname}</p>",
              emailsubject: "Hello from XXXX",
              sms: "Hello {personname} this is {myname} from XXXX. It was good meeting you! Do let me know if you like to know more about our church. God Bless and see you soon!" };
}

export class SummaryData {
  date: string = "";
  name: string = "";
  email: string = "";
  phone: string = "";
  description: string ="";
  groups: any = {};

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

// This class contains all the fields NOT duplicated
export class SummaryDataKey extends SummaryData {
  details_key: string = ""; // The link to the details record
  followup_name: string = ""; // The name of the person assigned to followup
  followup_id: string = "";  // The if person assigned to follow up on the the new comer
  assign_date: string = ""; // Date that the assignment occurred
  assign_id: string ="";  // The id of the person who assigned the person
  add_id: string =""; // The id of the person who added the person
  followup_state: string =""; // The state of the followup 

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
  description: string ="";
  groups: any = {};

  constructor() {
  }
}
