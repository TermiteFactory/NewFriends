import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';

/**
 * Generated class for the AssignNewcomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assign-newcomer',
  templateUrl: 'assign-newcomer.html',
})
export class AssignNewcomerPage {

  members: Observable<any[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider, public authData: AuthProvider) {
    this.members = matchDb.getPermissionsList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssignNewcomerPage');
  }

  assignMember(member: any) {

    this.matchDb.updateAssignment(this.navParams.data.summarykey, member.key,  member.name, this.authData.profile.getValue().uid);
    this.navCtrl.pop();
  }

  removeAssign() {
    this.matchDb.updateAssignment(this.navParams.data.summarykey, "",  "", "");
    this.navCtrl.pop();
  }

}
