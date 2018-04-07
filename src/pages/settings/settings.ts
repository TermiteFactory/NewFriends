import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { App } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { MatchstickDbProvider, Membership } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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

  membership: Observable<Membership[]>;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,public authData: AuthProvider, 
    public app: App, public alertCtrl: AlertController, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
      this.permissions = matchDb.getPermissionsList();
      this.membership = matchDb.getMembershipList();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  logoutUser() {
    this.matchDb.pendingSignout();
    this.app.getRootNav().setRoot('LoginPage');
    this.authData.logoutUser();
  }

  changeNamePrompt() {
    let myname = this.authData.authState.getValue().displayName;
    let prompt = this.alertCtrl.create({
      title: 'Display Name',
      inputs: [
        {
          name: 'name',
          value: myname
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
          text: 'Change',
          handler: data => {
            this.changeName(data.name);
          }
        }
      ]
    });
    prompt.present();
  }

  changeName(name: string) {
    this.authData.addProfileData(name);
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
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

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
        if (loading!=null) {
          loading.dismiss();
          loading = null
        }
      }

      communityListSub.unsubscribe();
    });
  }

  goToNotificationSettings() {
    this.navCtrl.push("NotificationSettingsPage");
  }

  ngOnDestroy() {
    if (this.tokenSub != null) {
      this.tokenSub.unsubscribe();
    }
  }

}
