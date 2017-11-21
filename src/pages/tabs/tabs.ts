import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { NewComersPage } from '../new-comers/new-comers';
import { ForMePage } from '../for-me/for-me';
import { GroupsPage } from '../groups/groups';
import { SettingsPage } from '../settings/settings';

/**
 * Generated class for the TabsPage tabs.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  newComersRoot: any = NewComersPage;
  forMeRoot: any = ForMePage;
  groupsRoot: any = GroupsPage;
  settingsRoot: any = SettingsPage;


  constructor(public navCtrl: NavController) {}

}
