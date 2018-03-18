import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the AssignStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assign-status',
  templateUrl: 'assign-status.html',
})
export class AssignStatusPage {

  members: Observable<any[]>;
  summary: Observable<any>;

  get_details: string = "GetDetails";
  get_indication: string = "GetIndication";
  link_up: string = "LinkUp";
  no_followup: string = "NoFollowup";

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider, public authData: AuthProvider) {
    this.members = matchDb.getPermissionsList();
    this.summary = matchDb.getSummary(navParams.data.summarykey);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssignStatusPage');
  }

  assignStatus(status: string) {
    this.matchDb.updateFollowupStatus(this.navParams.data.summarykey, status);
    this.navCtrl.pop();
  }
}
