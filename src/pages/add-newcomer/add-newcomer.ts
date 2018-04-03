import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { MatchstickDbProvider, DetailedData, GroupConfig } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';

/**
 * Generated class for the AddNewcomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-newcomer',
  templateUrl: 'add-newcomer.html',
})
export class AddNewcomerPage {

  newComer: DetailedData = new DetailedData;
  groupsconfig: GroupConfig[];

  subGroups: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
              public loadingCtrl: LoadingController) {
    
    function pad(datenum: Number) {
      let datestring : String;
      datestring = datenum.toString();
      if (datestring.length == 2) {
        return datestring;
      }
      else {
        return '0' + datestring;
      }
    }

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.subGroups = matchDb.getGroupsConfig().subscribe( (g) => {
      if (g != null) {
        this.groupsconfig = g;
        if (loading!=null) {
          loading.dismiss();
          loading = null;
        }
      }
    });

    let today = new Date;
    this.newComer.dateVisited= today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate()); 
  }

  onGroupChange(event: any, groupkey: string) {
    if (event.checked == true) {
      this.newComer.groups[groupkey] = true;
    }
    else {
      delete this.newComer.groups[groupkey];
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddNewcomerPage');
  }

  submit() {
    this.matchDb.addData(this.newComer);
    this.navCtrl.pop();
  }

}
