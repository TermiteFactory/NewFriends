import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { NewComersPage } from '../new-comers/new-comers';
import { ForMePage } from '../for-me/for-me';
import { GroupsPage } from '../groups/groups';
import { SettingsPage } from '../settings/settings';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider } from '../../providers/auth/auth';
import { Subscription } from 'rxjs/Subscription';

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
export class TabsPage{

  newComersRoot: any = NewComersPage;
  forMeRoot: any = ForMePage;
  groupsRoot: any = GroupsPage;
  settingsRoot: any = SettingsPage;

  forMeBadge: string = "";
  summarySub: Subscription;

  constructor(public navCtrl: NavController, public matchDb: MatchstickDbProvider, public authData: AuthProvider) {
    this.matchDb.validAuth.subscribe((state) => {
      if (state == false) {
         if (this.summarySub!=null) {
           this.summarySub.unsubscribe();
         }
      } else if (state == true) {
        let auth = authData.authState.getValue();
        this.summarySub = matchDb.getSummaryList(ref=>ref.orderByChild('followup_id').equalTo(auth.uid)).subscribe( (list) => {
          if (list.length == 0) {
            this.forMeBadge = "";
          } else {
            this.forMeBadge = list.length.toString();
          }
        });
      }
    });
  }
}
