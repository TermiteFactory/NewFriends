import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the GroupListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
})
export class GroupListPage {
  groupName: String = "";
  newcomersSummary: Observable<any[]>;
  myNavCtrl: NavController;

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.myNavCtrl = navCtrl;
    this.groupName = navParams.data.label_name;
    this.newcomersSummary = afd.list('/summary', ref=>ref.orderByChild(navParams.data.tag_name).equalTo(true)).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupListPage');
  }

  showDetail(personDetailsKey: string, personKey: string) {
    this.myNavCtrl.push("NewcomerDetailsPage", { 
      newcomerkey: personDetailsKey, 
      summarykey: personKey 
    });
  }

}
