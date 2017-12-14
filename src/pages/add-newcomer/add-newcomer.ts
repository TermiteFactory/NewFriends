import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MatchstickDbProvider, SummaryData, DetailedData } from '../../providers/matchstick-db/matchstick-db';

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

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider) {
    
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

    let today = new Date;
    this.newComer.data.dateVisited= today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate()); 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddNewcomerPage');
  }

  submit() {
    this.matchDb.addData(this.newComer).then( ()=> {
      this.navCtrl.pop();
    });
  }

}
