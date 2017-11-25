import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

/**
 * Generated class for the NewcomerDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-newcomer-details',
  templateUrl: 'newcomer-details.html',
})
export class NewcomerDetailsPage {
  newcomerdetails: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.newcomerdetails = afd.object('/bykey/' + navParams.data.newcomerkey).valueChanges();
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewcomerDetailsPage');
  }

}
