import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { App } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { MatchstickDbProvider, Community } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { FCM } from '@ionic-native/fcm';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnDestroy {

  permissions: Observable<any[]>;
  newComerNotify: boolean;
  newComerAssigned: boolean;
  tokenSub: Subscription;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public authData: AuthProvider, 
    public app: App, public alertCtrl: AlertController, public matchDb: MatchstickDbProvider, private storage: Storage,
    private fcm: FCM) {
    
      this.permissions = matchDb.getPermissionsList();

      storage.get('newComerNotify').then((val) => {
        if (val == null) {
          this.newComerNotify = true;
          this.updateNotify();
        } else {
          this.newComerNotify = val;
        }
      });
      storage.get('newComerAssigned').then((val) => {
        if (val == null) {
          this.newComerAssigned = true;
          this.updateAssigned();
        } else {
          this.newComerAssigned = val;
        }
      });

      // Handle the case where the token can change after an OS upgrade
      let tokenSub = this.fcm.onTokenRefresh().subscribe( () => {
        this.updateAssigned();
        this.updateNotify();
      }, error => {});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  logoutUser() {
    this.authData.logoutUser().then( () => {
      this.app.getRootNav().setRoot('LoginPage');
    });
  }

  updateNotify() {
    this.storage.set('newComerNotify', this.newComerNotify);
    this.matchDb.updateNotifyNew(this.newComerNotify);
  }

  updateAssigned() {
    this.storage.set('newComerAssigned', this.newComerAssigned);
    this.matchDb.updateNotifyAssigned(this.newComerAssigned);
  }

  communityPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Add Community',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name of Community'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: data => {
            this.addCommunity(data.name);
          }
        }
      ]
    });
    prompt.present();
  }

  addCommunity(name: string) {
    this.matchDb.addCommunity(name);
  }

  memberAction(permission: any) {
    if (permission.auth=='Pending') {
      this.matchDb.updatePermission(permission.key, 'Member');
    }
    else {
      this.matchDb.updatePermission(permission.key, 'Pending');
    }
  }

  communityListPrompt() {
    let communityListSub: Subscription = this.matchDb.getCommunityList().subscribe( (list) => {
      if (list!=null) {
        let inputList = [];
        list.forEach((community) => {
          inputList.push({type: 'radio', label: community.name, value: community.key});
        })
        inputList.push({type: 'radio', label: 'Leave All', value: ""});
        let prompt = this.alertCtrl.create({
          title: 'Select a Community to Join',
          inputs: inputList,
          buttons: [
            {
              text: 'Cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Join',
              handler: data => {
                this.matchDb.setCommmunity(data);
              }
            }
          ]
        });
        prompt.present();
      }

      communityListSub.unsubscribe();
    });
  }

  ngOnDestroy() {
    if (this.tokenSub != null) {
      this.tokenSub.unsubscribe();
    }
  }

}
