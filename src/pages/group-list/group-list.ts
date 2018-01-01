import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public actionSheetCtrl: ActionSheetController) {
    this.groupName = navParams.data.label_name;
    this.newcomersSummary = matchDb.getSummaryList(ref=>ref.orderByChild(navParams.data.tag_name).equalTo(true));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupListPage');
  }

  showDetail(personDetailsKey: string, personKey: string) {
    this.navCtrl.push("NewcomerDetailsPage", { 
      newcomerkey: personDetailsKey, 
      summarykey: personKey 
    });
  }

  showActions(event: any) {
    event.stopPropagation();
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contact Newcomer',
      buttons: [
        {
          text: 'Email',
          role: 'email',
          handler: () => {
            console.log('Destructive clicked');
          }
        },{
          text: 'Call',
          role: 'call',
          handler: () => {
            console.log('Archive clicked');
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
}
