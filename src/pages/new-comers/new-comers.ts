import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

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
export class NewComersPage {
  newcomersSummary: Observable<any[]>;
  filteredSummaryList: any[];
  originalSummaryList: any[]; 
  searchTerm: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.newcomersSummary = afd.list('/summary', ref=>ref.orderByChild("date")).snapshotChanges().map(changes => {
      return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
    });
    this.newcomersSummary.subscribe( data => {
        this.originalSummaryList = data;
        this.setFilteredItems();
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

}
