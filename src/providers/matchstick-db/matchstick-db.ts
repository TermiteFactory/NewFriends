import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireObject, QueryFn } from 'angularfire2/database/interfaces';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the MatchstickDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MatchstickDbProvider {

  constructor(public authData: AuthProvider, public afd:AngularFireDatabase) {
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
      this.getDetailedRef(detailedKey).update(data.data).then(() => {
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
      this.getDetailedListRef().push(detailData.data).then( pushRtn => {
        let summary: SummaryDataKey = new SummaryDataKey;
        this.copyToSummary(detailData, summary);
        summary.data.details_key = pushRtn.key;
        this.getSummaryListRef().push(summary.data).then( () => {
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

  copyToSummary (from: DetailedData, to: any)  {
    to.data.date = from.data.dateVisited;
    to.data.name = from.data.name;
    to.data.tag_alpha = from.data.tag_alpha;
    to.data.tag_connect = from.data.tag_connect;
    to.data.tag_churchschool = from.data.tag_churchschool;
    to.data.tag_yam = from.data.tag_yam;
    to.data.tag_cvl = from.data.tag_cvl;
    to.data.tag_pastor = from.data.tag_pastor;
    to.data.tag_nocontact = from.data.tag_nocontact;
  }

  getSummaryList(queryFn?: QueryFn): Observable<any[]> {
    return this.afd.list('/summary', queryFn).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }
}

export class SummaryDataKey {
  data: {  
    date: string,
    name: string,
    details_key: string,
    tag_alpha: boolean,
    tag_connect: boolean,
    tag_churchschool: boolean,
    tag_yam: boolean,
    tag_cvl: boolean,
    tag_pastor: boolean,
    tag_nocontact: boolean } = {
      date: "",
      name: "",
      details_key: "",
      tag_alpha: false,
      tag_connect: false,
      tag_churchschool: false,
      tag_yam: false,
      tag_cvl: false,
      tag_pastor: false,
      tag_nocontact: false
    }

  constructor() {
  }
}

export class SummaryData {
    data: {  
      date: string,
      name: string,
      tag_alpha: boolean,
      tag_connect: boolean,
      tag_churchschool: boolean,
      tag_yam: boolean,
      tag_cvl: boolean,
      tag_pastor: boolean,
      tag_nocontact: boolean } = {
        date: "",
        name: "",
        tag_alpha: false,
        tag_connect: false,
        tag_churchschool: false,
        tag_yam: false,
        tag_cvl: false,
        tag_pastor: false,
        tag_nocontact: false
      }

    constructor() {
    }
}

export class DetailedData {
  data : { 
    dateVisited: string,
    name : string
    cameWith : string
    age: string
    phone: string
    email: string
    religion: string
    purpose: string
    visitedBefore: string
    tag_alpha: boolean,
    tag_connect: boolean,
    tag_churchschool: boolean,
    tag_yam: boolean,
    tag_cvl: boolean,
    tag_pastor: boolean,
    tag_nocontact: boolean  } = {
      dateVisited : "",
      name : "",
      cameWith : "",
      age : "",
      phone : "",
      email : "",
      religion : "",
      purpose : "",
      visitedBefore : "",
      tag_alpha : false,
      tag_connect : false,
      tag_churchschool : false,
      tag_yam : false,
      tag_cvl : false,
      tag_pastor : false,
      tag_nocontact : false
    };

    constructor() {
    }
}
