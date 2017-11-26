import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'matchstick-bydate-newcomers',
  templateUrl: 'bydate-newcomers.html'
})
export class ByDateNewcomers {
  @Input() person;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  showDetails() {
    this.navCtrl.push("NewcomerDetailsPage", { newcomerkey: this.person.details_key, 
                                               summarykey: this.person.key });
  }
}
