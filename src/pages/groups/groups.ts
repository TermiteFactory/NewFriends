import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MatchstickDbProvider } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

/**
 * Generated class for the GroupsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-groups',
  templateUrl: 'groups.html',
})
export class GroupsPage implements OnDestroy{

  groupsListing: {label: string, tag: string, count: number}[] = 
            [ 
              { label: "Learn about Alpha", tag: "tag_alpha", count: 0 },
              { label: "Learn about Connect/Cell Group", tag: "tag_connect", count: 0 },
              { label: "Learn about Church School/ XS", tag: "tag_churchschool", count: 0 },
              { label: "Learn about YAM", tag: "tag_yam", count: 0 },
              { label: "Learn about CVL", tag: "tag_cvl", count: 0 },
              { label: "Speak to Pastor", tag: "tag_pastor", count: 0 },
              { label: "Do not Contact", tag: "tag_nocontact", count: 0 }
            ];
  myNavCtrl: NavController;
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider) {
    this.sub = matchDb.getSummaryList().subscribe( people => {
      this.groupsListing.forEach(listing => listing.count = 0);
      people.forEach( person => {
         this.groupsListing.forEach(listing => {
            if (person[listing.tag] == true) { 
              listing.count = listing.count + 1;
            };
         });
      })
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
  }

  showGroupList(tagname : string, labelname: string) {
    this.navCtrl.push("GroupListPage", { tag_name: tagname, label_name: labelname });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
