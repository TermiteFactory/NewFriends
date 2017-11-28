import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireObject } from 'angularfire2/database/interfaces';

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
export class EditNewcomerPage {

  newcomerdetailsRef: AngularFireObject<any>;
  summaryRef: AngularFireObject<any>;
  data_db : { 
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.myNavCtrl = navCtrl;
    this.summaryRef = afd.object('/summary/' + navParams.data.summarykey);
    this.newcomerdetailsRef= afd.object('/bykey/' + navParams.data.newcomerkey);
    this.newcomerdetailsRef.valueChanges().subscribe( mydata => {
                                      this.data_db = mydata;
                                      Object.assign(this.data, mydata); 
                                });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditNewcomerPage');
  }

  deleteNewcomer() {
    this.newcomerdetailsRef.remove().then (
      () => this.summaryRef.remove().then (
        () => this.myNavCtrl.popToRoot()
      )
    );
  }

  submitEdit() {
    
  }

  undoEdit() {
    Object.assign(this.data, this.data_db);
  }

}
