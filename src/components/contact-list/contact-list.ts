import { Component,  Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';

/**
 * Generated class for the ContactListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'contact-list',
  templateUrl: 'contact-list.html'
})
export class ContactListComponent {

  @Input() newcomersSummary: Observable<any[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams,public actionSheetCtrl: ActionSheetController, 
    public matchDb: MatchstickDbProvider) {
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
