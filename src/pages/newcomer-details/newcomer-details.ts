import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput } from 'ionic-angular';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertController } from 'ionic-angular';
import { MatchstickDbProvider, DetailedData, Note } from '../../providers/matchstick-db/matchstick-db';

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
  notes: Note[] = [];

  detailSub: Subscription;
  notesSub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public alertCtrl: AlertController) {
      this.detailSub = this.matchDb.getDetailed(navParams.data.newcomerkey).subscribe( data => {
        this.local_data = data; 
      });
      this.notesSub = this.matchDb.getNotes(navParams.data.newcomerkey).subscribe( data => {
        this.notes = data;
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
    this.detailSub.unsubscribe();
  }

  submitComment(textArea: TextInput) {
    if (textArea.value != "") {
      let today = new Date;
      this.matchDb.addNote(this.navParams.data.newcomerkey, textArea.value, today.toISOString());
      textArea.clearTextInput();
    }
  }

}
