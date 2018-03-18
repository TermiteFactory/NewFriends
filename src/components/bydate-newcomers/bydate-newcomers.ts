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
  state_color: string;
  state_icon: string;
  person: any;

  constructor(public navCtrl: NavController) {
  }

  @Input() 
  set inputperson(data: any) {
    this.person = data;
    if (this.person.followup_name!="") {
      this.state_color = "secondary";
    } else {
      this.state_color = "grey";
    }
    
    if (this.person.followup_state == "GetDetails") {
      this.state_icon = "search";
    } else if (this.person.followup_state == "GetIndication") {
      this.state_icon = "time";
    } else if (this.person.followup_state == "LinkUp") {
      this.state_icon = "checkbox";
    } else if (this.person.followup_state == "NoFollowup") {
      this.state_icon = "hand";
    } else {
      this.state_icon = "search";
    }
  }

  showDetails() {
    this.navCtrl.push("NewcomerDetailsPage", { newcomerkey: this.person.details_key, 
                                               summarykey: this.person.key });
  }

  assignNewcomer(event: any) {
    this.navCtrl.push("AssignNewcomerPage", { summarykey: this.person.key,
                                              name: this.person.name,
                                              current: this.person.followup_name});
  }

  assignStatus(event: any) {
    this.navCtrl.push("AssignStatusPage", { summarykey: this.person.key,
                                            name: this.person.name,
                                            current: this.person.followup_name});
  }

}
