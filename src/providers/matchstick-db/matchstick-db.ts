import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthProvider, Profile } from '../../providers/auth/auth';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

/*
  Generated class for the MatchstickDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MatchstickDbProvider implements OnDestroy {

  communityName: Observable<string>;
  joinState: Observable<string>;
  profileSub: Subscription;

  constructor(public authData: AuthProvider, public afd:AngularFireDatabase) {
    // Subscribe to profile
    this.profileSub = authData.profile.subscribe( (profile) => {
      if (profile!=null) {
        if (profile.community != "") {
          let authSub: Subscription = this.authData.authState.subscribe( (user) => {
            // user should not be null at this point!
            this.switchCommunity(profile.community, user.uid);
            authSub.unsubscribe();
          });
        }
      }
    });
  }
  
  switchCommunity(communityId: string, uid: string){
    let permissionSub: Subscription = this.afd.object('/communities/' + communityId + '/permissions/').valueChanges().subscribe( (state) => {
      if (state != null) {
        if (state == 0 || !(uid in state)) {
          this.afd.object('/communities/' + communityId + '/permissions/' + uid).set("Pending");
        }
        permissionSub.unsubscribe();      
      }
    });
    // Set the profile with community
    this.communityName = this.afd.object<string>('/communities/' + communityId + '/name').valueChanges();
    this.joinState = this.afd.object<string>('/communities/' + communityId + '/permissions/' + uid).valueChanges();
  }

  getDetailedListRef(): AngularFireList<any> {
    return this.afd.list('/bykey');
  }

  getSummaryListRef(): AngularFireList<any> {
    return this.afd.list('/summary');
  }

  getDetailedRef(detailedKey: string): AngularFireObject<any> {
    return this.afd.object('/bykey/' + detailedKey);
  }

  getSummaryRef(summaryKey: string): AngularFireObject<any> {
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
      this.afd.object<Profile>('/profiles/' + user.uid).update({community: communityId});
      authSub.unsubscribe();
    });
    
  }

  ngOnDestroy() {
    this.profileSub.unsubscribe();
  }
  
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
