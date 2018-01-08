import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';

/**
 * Generated class for the ForMePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-for-me',
  templateUrl: 'for-me.html',
})
export class ForMePage {
  
  newcomersSummary: Observable<any[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider, public authData: AuthProvider,
    public actionSheetCtrl: ActionSheetController) {
    let profuid = authData.profile.getValue();
    this.newcomersSummary = matchDb.getSummaryList(ref=>ref.orderByChild('followup_id').equalTo(profuid.uid));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForMePage');
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
