import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { MatchstickDbProvider, GroupConfig, SummaryDataKey } from '../../providers/matchstick-db/matchstick-db';
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

  groupsListing: {label: string, key: string, count: number}[] = []
  groupsconfig: GroupConfig[] = [];
  summary: SummaryDataKey[] = [];

  subGroups: Subscription;
  myNavCtrl: NavController;
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public loadingCtrl: LoadingController) {
    
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();

    let summaryOk = false;
    let groupsOk = false;

    let checkAndDismiss = () => {
      if (summaryOk==true && groupsOk==true) {
        this.generateGroupsListing();
        if (loading!=null) {
          loading.dismiss();
          loading = null;
        }
      }
    };

    this.subGroups = matchDb.getGroupsConfig().subscribe( (config) => {
      if (config != null) {
        this.groupsListing = [];
        config.forEach( config => {
          this.groupsListing.push({label: config.desc, key: config.key, count: 0})
        });
        groupsOk = true;
        checkAndDismiss();
      }
    });

    this.matchDb.validAuth.subscribe((state) => {
      if (state == false) {
        if (this.sub!=null) {
          this.sub.unsubscribe();
        }
      } else {
        this.sub = matchDb.getSummaryList().subscribe( people => {
          this.summary = people;
          summaryOk = true;
          checkAndDismiss();
        });
      }
    })
  }

  generateGroupsListing() {
    this.groupsListing.forEach(listing => listing.count = 0);
    this.summary.forEach( person => {
        this.groupsListing.forEach(listing => {
          if (person.groups!=undefined && person.groups[listing.key] == true) { 
            listing.count = listing.count + 1;
          };
        });
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GroupsPage');
  }

  showGroupList(tagname : string, labelname: string) {
    this.navCtrl.push("GroupListPage", { tag_name: tagname, label_name: labelname });
  }

  ngOnDestroy() {
    if (this.sub!=null) {
      this.sub.unsubscribe();
    }
    if (this.subGroups!=null) {
      this.subGroups.unsubscribe();
    }
  }

}
