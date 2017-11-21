import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'matchstick-bydate-newcomers',
  templateUrl: 'bydate-newcomers.html'
})
export class ByDateNewcomers {
  @Input() newcomersbydate;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  showDetails(person) {
    this.navCtrl.push("NewcomerDetailsPage", { newcomer: person });
  }
}
