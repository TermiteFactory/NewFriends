import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireObject } from 'angularfire2/database/interfaces';

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
  
  data : { 
    dateVisited: String,
    name : String
    cameWith : String
    age: String
    phone: String
    email: String
    religion: String
    purpose: String
    visitedBefore: String
    tag_alpha: boolean,
    tag_connect: boolean,
    tag_churchschool: boolean,
    tag_yam: boolean,
    tag_cvl: boolean,
    tag_pastor: boolean,
    tag_nocontact: boolean } = {
      dateVisited : "",
      name : "",
      cameWith : "",
      age : "",
      phone : "",
      email : "",
      religion : "",
      purpose : "",
      visitedBefore : "",
      tag_alpha : false,
      tag_connect : false,
      tag_churchschool : false,
      tag_yam : false,
      tag_cvl : false,
      tag_pastor : false,
      tag_nocontact : false 
    };
    myNavCtrl: NavController;
    myNavParams: NavParams;
    newcomerdetailsRef: AngularFireObject<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.myNavCtrl = navCtrl;
    this.myNavParams = navParams;
    this.newcomerdetailsRef= afd.object('/bykey/' + navParams.data.newcomerkey);
    this.newcomerdetailsRef.valueChanges().subscribe( mydata => this.data = mydata);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewcomerDetailsPage');
  }

  editNewcomer() {
    this.myNavCtrl.push("EditNewcomerPage", { newcomerkey: this.myNavParams.data.newcomerkey, 
                                              summarykey: this.myNavParams.data.summarykey });
  }

}
