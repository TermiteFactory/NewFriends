import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertController } from 'ionic-angular';
import { MatchstickDbProvider, DetailedData } from '../../providers/matchstick-db/matchstick-db';

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
export class NewcomerDetailsPage implements OnDestroy {

  local_data: DetailedData = new DetailedData;
  sub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public alertCtrl: AlertController) {
      this.sub = this.matchDb.getDetailedRef(navParams.data.newcomerkey).valueChanges().subscribe( data => {
        this.local_data = data; 
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewcomerDetailsPage');
  }

  editNewcomer() {
    this.navCtrl.push("EditNewcomerPage", { newcomerkey: this.navParams.data.newcomerkey, 
                                            summarykey: this.navParams.data.summarykey });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  commentPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Comment',
      inputs: [
        {
          name: 'comment',
          placeholder: 'Comment'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }

}
