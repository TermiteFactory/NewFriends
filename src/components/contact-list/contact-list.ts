import { Component,  Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { SMS } from '@ionic-native/sms';
import { CallNumber } from '@ionic-native/call-number';

import { AuthProvider } from '../../providers/auth/auth';

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
    public matchDb: MatchstickDbProvider, private sms: SMS, public authData: AuthProvider, private callNumber: CallNumber) {
  }

  showDetail(personDetailsKey: string, personKey: string) {
    this.navCtrl.push("NewcomerDetailsPage", { 
      newcomerkey: personDetailsKey, 
      summarykey: personKey 
    });
  }

  showActions(event: any, person: any) {
    event.stopPropagation();

    let msg: string = 'Hi ' + person.name + ' this is ' + this.authData.authState.getValue().displayName + 
    ' from Charis Methodist Church. It was good meeting you! Do let me know if you like more about our church. God bless and see you soon!';

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
            this.callNumber.callNumber(person.phone, false);
          }
        },{
          text: 'SMS',
          role: 'sms',
          handler: () => {
            this.sms.send(person.phone, msg , {android: {intent: "INTENT"}});
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
