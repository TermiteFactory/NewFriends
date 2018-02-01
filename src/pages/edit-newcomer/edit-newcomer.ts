import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatchstickDbProvider, DetailedData } from '../../providers/matchstick-db/matchstick-db';
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
  local_data: DetailedData = new DetailedData;
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.sub = this.matchDb.getDetailed(navParams.data.newcomerkey).subscribe( mydata => {
      this.db_data = mydata;
      Object.assign(this.local_data, mydata); 
      if (loading!=null) {
        loading.dismiss();
        loading = null
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
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
