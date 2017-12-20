import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

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

  constructor(public authData: AuthProvider, public afd:AngularFireDatabase) {
    
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
        if (profileUid.community == "") {
          observer.next(null);
        }
        else {
          let currentData: JoinData = new JoinData;
          nameSub = this.afd.object<string>('/communities/' + profileUid.community + '/name').valueChanges().subscribe( (name) => {
            currentData.communityName = name;
            observer.next(currentData);
          });
          stateSub = this.afd.object<string>('/communities/' + profileUid.community + '/permissions/' + profileUid.uid).valueChanges().subscribe( (state) => {
            currentData.joinState = state;
            observer.next(currentData);
          });
        }
      });
    });

    this.communityState = new BehaviorSubject(null);
    this.communityStateObservable.subscribe(this.communityState);
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
                this.afd.object('/communities/' + profileUid.community + '/permissions/' + profileUid.uid).set("Pending");
              }
              permissionSub.unsubscribe();      
            }
          }); 
        }
      }
    });
  }

  private getDetailedListRef(): AngularFireList<any> {
    return this.afd.list('/bykey');
  }

  private getSummaryListRef(): AngularFireList<any> {
    return this.afd.list('/summary');
  }

  private getDetailedRef(detailedKey: string): AngularFireObject<any> {
    return this.afd.object('/bykey/' + detailedKey);
  }

  private getSummaryRef(summaryKey: string): AngularFireObject<any> {
    return this.afd.object('/summary/' + summaryKey);
  }

  updateData( detailedKey: string, summaryKey: string, data: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      this.getDetailedRef(detailedKey).update(data).then(() => {
        let summarydata = new SummaryData;
        this.copyToSummary(data, summarydata);
        this.getSummaryRef(summaryKey).update(summarydata).then( () => {
          resolve();
        }, () => reject);
      }, () => reject);    
    });    
  }

  addData(detailData: DetailedData): Promise<void> {
    return new Promise( (resolve, reject) => {
      this.getDetailedListRef().push(detailData).then( pushRtn => {
        let summary: SummaryDataKey = new SummaryDataKey;
        this.copyToSummary(detailData, summary);
        summary.details_key = pushRtn.key;
        this.getSummaryListRef().push(summary).then( () => {
          resolve();
        }, () => reject() );
      }, () => reject() );
    });
  }

  deleteData( detailedKey: string, summaryKey: string) : Promise<void> {
    return new Promise( (resolve, reject) => {
      this.getDetailedRef(detailedKey).remove().then ( () => {
        this.getSummaryRef(summaryKey).remove().then ( () => {
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
  }

  getSummaryList(queryFn?: QueryFn): Observable<any[]> {
    return this.afd.list('/summary', queryFn).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  getDetailed(detailedKey: string) : Observable<any> {
    return this.getDetailedRef(detailedKey).valueChanges();
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
    let authSub: Subscription = this.authData.authState.subscribe( (user) => {
      // user should not be null at this point!
      this.authData.updateCommunity(communityId, user.uid);
      authSub.unsubscribe();
    });
  }

  ngOnDestroy() {
    this.profileSub.unsubscribe();
  }
  
}

export class JoinData {
  communityName: string;
  joinState: string;
}

export class Community {
  name: string = "";
  permissions: 0;
  data: { summary: 0, persons: 0};
}

export class SummaryData {
  date: string = "";
  name: string = "";
  details_key: string = "";
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

export class SummaryDataKey extends SummaryData {
  details_key: string = "";

  constructor() {
    super();
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
