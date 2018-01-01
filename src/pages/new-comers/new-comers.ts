import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

/**
 * Generated class for the NewComersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-new-comers',
  templateUrl: 'new-comers.html'
})
export class NewComersPage implements OnDestroy {
  filteredSummaryList: any[];
  originalSummaryList: any[]; 
  searchTerm: string = '';
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    this.sub = matchDb.getSummaryList(ref=>ref.orderByChild("date")).subscribe( data => {
        this.originalSummaryList = data;
        this.setFilteredItems();
        
        if (loading!=null) {
          loading.dismiss();
          loading = null;
        }
     });
  }

  addNewcomer() {
    this.navCtrl.push("AddNewcomerPage");
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad NewComersPage');
  }

  setFilteredItems() {
    if (this.searchTerm!='') {
      this.filteredSummaryList = [];
      this.originalSummaryList.forEach( item => {
        if (item.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1) {
          this.filteredSummaryList.push(item);
        }
      } );
    } else {
      this.filteredSummaryList = this.originalSummaryList;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
