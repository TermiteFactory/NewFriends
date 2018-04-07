import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { MatchstickDbProvider, NotifyCommunityConfKey, GroupConfig } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the NotificationSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification-settings',
  templateUrl: 'notification-settings.html',
})
export class NotificationSettingsPage {

  notifications: NotifyCommunityConfKey[] = [];
  groupsconf: GroupConfig[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public authData: AuthProvider,  
    public alertCtrl: AlertController, public matchDb: MatchstickDbProvider, public loadingCtrl: LoadingController) {

      this.matchDb.getGroupsConfig().subscribe( conf => {
        if (conf!=null) {
          this.groupsconf = conf;
          this.matchDb.getNotificationSettings().subscribe( list => {
            this.notifications = list;
          });
        }
      });
  }

  getPropertyNames(group: any) : string[] {
    return Object.getOwnPropertyNames(group);
  }

  retrieveGroupDesc(groupKey: string) : string {
    let desc = "";
    this.groupsconf.forEach(element => {
      if (groupKey == element.key) {
        desc = element.desc;
        return;
      }
    });
    return desc;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationSettingsPage');
  }

}
