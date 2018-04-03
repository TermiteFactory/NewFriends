import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatchstickDbProvider, DetailedData, GroupConfig } from '../../providers/matchstick-db/matchstick-db';
/**
 * Generated class for the EditNewcomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-newcomer',
  templateUrl: 'edit-newcomer.html',
})
export class EditNewcomerPage implements OnDestroy{

  db_data: DetailedData = new DetailedData;
  db_groups: any = {};
  local_data: DetailedData = new DetailedData;
  groupsconfig: GroupConfig[] = [];

  subGroups: Subscription;
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    let detailedOk = false;
    let groupsOk = false;

    let checkAndDismiss = () => {
      if (loading!=null && detailedOk==true && groupsOk==true) {
        loading.dismiss();
        loading = null;
      }
    };

    this.sub = this.matchDb.getDetailed(navParams.data.newcomerkey).subscribe( mydata => {
      this.db_data = mydata;
      Object.assign(this.local_data, mydata); 
      Object.assign(this.db_groups, mydata.groups); 
      detailedOk = true;
      checkAndDismiss();
    });

    this.subGroups = matchDb.getGroupsConfig().subscribe( (g) => {
      if (g != null) {
        this.groupsconfig = g;
        groupsOk = true;
        checkAndDismiss();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditNewcomerPage');
  }

  deleteNewcomer() {
    this.matchDb.deleteData(this.navParams.data.newcomerkey, this.navParams.data.summarykey);
    this.navCtrl.popToRoot();
  }

  submitEdit() {
    let loading = this.loadingCtrl.create({
      content: 'Updating...'
    });
    loading.present();
    this.matchDb.updateData(this.navParams.data.newcomerkey, 
                            this.navParams.data.summarykey, 
                            this.local_data)
      .then(() => {
        if (loading!=null) {
          loading.dismiss();
          loading = null
        }
        this.navCtrl.pop();
      }, () => {
        if (loading!=null) {
          loading.dismiss();
          loading = null
        }
        this.navCtrl.popToRoot();
      });
  }

  undoEdit() {
    Object.assign(this.local_data, this.db_data);
    Object.assign(this.local_data.groups, this.db_groups); 
  }

  onGroupChange(event: any, groupkey: string) {
    if (event.checked == true) {
      this.local_data.groups[groupkey] = true;
    }
    else {
      delete this.local_data.groups[groupkey];
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.subGroups.unsubscribe();
  }

}
