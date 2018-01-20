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

    let replace_data = (data: string): string => {
      let newData = data.replace(new RegExp('{personname}','g'), person.name);
      return newData.replace(new RegExp('{myname}','g'), myname);
    };

    let email = {
      to: person.email,
      subject: "",
      body: "",
      isHtml: true
    };

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contact Newcomer',
      buttons: [
        {
          text: 'Email',
          role: 'email',
          handler: () => {
            console.log('Email clicked');
            let sub1 = this.matchDb.getEmailSubject().subscribe( subject => {
              let sub2 = this.matchDb.getEmailBody().subscribe( body => {
                email.subject = replace_data(subject);
                email.body = replace_data(body);
                this.emailComposer.open(email).catch(()=> {});
                sub2.unsubscribe();
              })
              sub1.unsubscribe();
            })
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
            let sub = this.matchDb.getSmsString().subscribe( data => {
              let newData = replace_data(data);
              this.sms.send(person.phone, newData , {android: {intent: "INTENT"}}).catch(()=> {});
              sub.unsubscribe();
            })
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
