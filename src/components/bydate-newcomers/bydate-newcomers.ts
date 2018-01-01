import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

/**
 * Generated class for the BydateNewcomersComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bydate-newcomers',
  templateUrl: 'bydate-newcomers.html'
})
export class BydateNewcomersComponent {
  @Input() person;

  constructor(public navCtrl: NavController) {
  }

  showDetails() {
    this.navCtrl.push("NewcomerDetailsPage", { newcomerkey: this.person.details_key, 
                                               summarykey: this.person.key });
  }

  assignNewcomer(event: any) {
    event.stopPropagation();
  }

}
