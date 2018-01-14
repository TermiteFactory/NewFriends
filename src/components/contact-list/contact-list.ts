import { Component,  Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { SMS } from '@ionic-native/sms';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
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
    public matchDb: MatchstickDbProvider, private sms: SMS, public authData: AuthProvider, private callNumber: CallNumber,
    private emailComposer: EmailComposer) {
  }

  showDetail(personDetailsKey: string, personKey: string) {
    this.navCtrl.push("NewcomerDetailsPage", { 
      newcomerkey: personDetailsKey, 
      summarykey: personKey 
    });
  }

  showActions(event: any, person: any) {
    event.stopPropagation();

    let myname = this.authData.authState.getValue().displayName;

    let textmsg: string = 'Hi ' + person.name + ' this is ' + myname + 
    ' from Charis Methodist Church. It was good meeting you! Do let me know if you like to know more about our church. God Bless and see you soon!';

    let email = {
      to: person.email,
      subject: 'Hello from Charis Methodist Church',
      body: `<p>Hi `+ person.name + `,</p>
        <p>This is ` + myname +  ` from Charis Methodist Church. It was nice meeting you! Do let me know if you like to know more about our church. God Bless and see you soon!</p>
        <p>&nbsp;</p>
        <p>Blessings,</p>
        <p>` + myname + `</p>`,
      isHtml: true
    };

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contact Newcomer',
      buttons: [
        {
          text: 'Email',
          role: 'email',
          handler: () => {
            this.emailComposer.isAvailable().then((available: boolean) =>{
              if(available) {
                this.emailComposer.open(email);
              } else {
                console.log('Email Composer not avail');
              }
             }).catch( () => {});
          }
        },{
          text: 'Call',
          role: 'call',
          handler: () => {
            this.callNumber.callNumber(person.phone, false).catch(()=> {});
          }
        },{
          text: 'SMS',
          role: 'sms',
          handler: () => {
            this.sms.send(person.phone, textmsg , {android: {intent: "INTENT"}}).catch(()=> {});
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
