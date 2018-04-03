import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MatchstickDbProvider, FollowConfig } from '../../providers/matchstick-db/matchstick-db';
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
  config: FollowConfig[];
  searchTerm: string = '';
  sub: Subscription;
  subConfig: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
      this.matchDb.validAuth.subscribe((state) => {
       if (state == false) {
          this.cleanUp();
       } else {

        if (this.sub==null) {
          this.sub = matchDb.getSummaryList(ref=>ref.orderByChild("date")).subscribe( data => {
            this.originalSummaryList = data;
            this.setFilteredItems();
          });
        }

        if (this.subConfig==null) {
          this.subConfig = matchDb.getFollowupConfig().subscribe( (c) => {
            this.config = c;
          });
        }
       }
     })
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
        if ((item.name != null && item.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1) ||
            (item.description != null && item.description.toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1)) {
          this.filteredSummaryList.push(item);
        }
      } );
    } else {
      this.filteredSummaryList = this.originalSummaryList;
    }
  }

  cleanUp() {
    if (this.sub!=null) {
      this.sub.unsubscribe();
      this.sub = null;
    }
    if (this.subConfig!=null) {
      this.subConfig.unsubscribe();
      this.subConfig = null;
    }
  }

  ngOnDestroy() {
    this.cleanUp();
  }

}
