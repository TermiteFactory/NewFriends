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

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.newcomersSummary = afd.list('/summary', ref=>ref.orderByChild("date")).valueChanges();
  }

  addNewcomer() {
    this.navCtrl.push("AddNewcomerPage");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewComersPage');
  }

}
