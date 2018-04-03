import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { MatchstickDbProvider, FollowConfig, SummaryDataKey } from '../../providers/matchstick-db/matchstick-db';
import { AuthProvider } from '../../providers/auth/auth';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';
import { Summary } from '@angular/compiler';

/**
 * Generated class for the AssignStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-assign-status',
  templateUrl: 'assign-status.html',
})
export class AssignStatusPage implements OnDestroy {

  summary: SummaryDataKey;
  subSummary: Subscription;
  subConfig: Subscription;
  config: FollowConfig[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider, public authData: AuthProvider) {
    this.subSummary = matchDb.getSummary(navParams.data.summarykey).subscribe( s => {
      this.summary = s;
    })
    this.subConfig = matchDb.getFollowupConfig().subscribe( (c) => {
      this.config = c;
    });
  }

  displayButton( item :FollowConfig ) : boolean {
    if (this.summary == null) {
      return true;
    }
    if (item.key == this.summary.followup_state) {
      return false;
    }
    else if (item.default==true) {
      let found: boolean = false;
      this.config.forEach( (c)=> {
        if (c.key == this.summary.followup_state) {
          found = true;
        }
      })
      if (found == false) {
        return false; // If you cannot find, show text
      }
      else {
        return true;  // You found, its something else 
      }
    }
    return true;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AssignStatusPage');
  }

  assignStatus(status: string) {
    this.matchDb.updateFollowupStatus(this.navParams.data.summarykey, status);
    this.navCtrl.pop();
  }

  ngOnDestroy() {
    if (this.subConfig!=null) {
      this.subConfig.unsubscribe();
    }
    if (this.subSummary!=null) {
      this.subSummary.unsubscribe();
    }
  }
}
