import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

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
    tag_nocontact: boolean }; 

  newcomerRef : AngularFireList<any>;
  summaryRef : AngularFireList<any>;
  myAfd: AngularFireDatabase; 

  constructor(public navCtrl: NavController, public navParams: NavParams, public afd:AngularFireDatabase) {
    this.myAfd = afd;
    this.newcomerRef = afd.list('/bykey');
    this.summaryRef = afd.list('/summary')

    this.data.dateVisited = new Date().toDateString();
    this.data.name = "";
    this.data.cameWith = "";
    this.data.age = "";
    this.data.phone = "";
    this.data.email = "";
    this.data.religion = "";
    this.data.purpose = "";
    this.data.visitedBefore = "";
    this.data.tag_alpha = false;
    this.data.tag_connect = false;
    this.data.tag_churchschool = false;
    this.data.tag_yam = false;
    this.data.tag_cvl = false;
    this.data.tag_pastor = false;
    this.data.tag_nocontact = false;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddNewcomerPage');
  }

  addToSummary(newcomerKey) {
    let summary_data = {  date: this.data.dateVisited,
                          name: this.data.name,
                          details_key: newcomerKey.key,
                          tag_alpha: this.data.tag_alpha,
                          tag_connect: this.data.tag_connect,
                          tag_churchschool: this.data.tag_churchschool,
                          tag_yam: this.data.tag_yam,
                          tag_cvl: this.data.tag_cvl,
                          tag_pastor: this.data.tag_pastor,
                          tag_nocontact: this.data.tag_nocontact };

    this.summaryRef.push(summary_data);
  }

  submit() {
    this.newcomerRef.push(this.data)
      .then( (key) => this.addToSummary(key));
  }

}
