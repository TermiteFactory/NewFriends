import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput, LoadingController } from 'ionic-angular';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AlertController } from 'ionic-angular';
import { AuthProvider, ProfileUid } from '../../providers/auth/auth';
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
  notes: any[] = [];
  editNoteKey: BehaviorSubject<string>;

  detailRtn: boolean = false;
  notesRtn: boolean = false;

  detailSub: Subscription;
  notesSub: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public authData: AuthProvider) {

      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();

      this.detailSub = this.matchDb.getDetailed(navParams.data.newcomerkey).subscribe( data => {
        if (data!=null) {
          this.local_data = data; 
          this.detailRtn = true;
          if (this.notesRtn==true) {
            if (loading!=null) {
              loading.dismiss();
              loading = null
            }
          }
        }
      });
      this.notesSub = this.matchDb.getNotes(navParams.data.newcomerkey).subscribe( data => {
        if (data != null) {
          this.notes = data;
          this.notesRtn = true;
          if (this.detailRtn==true) {
            if (loading!=null) {
              loading.dismiss();
              loading = null
            }
          }
        }
      });

      this.editNoteKey = new BehaviorSubject("");
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

  submitNote(textArea: TextInput) {
    if (textArea.value != "") {
      let today = new Date;
      this.matchDb.addNote(this.navParams.data.newcomerkey, textArea.value, today.toISOString());
      textArea.clearTextInput();
    }
  }

  deleteNote(key: string) {
    this.matchDb.deleteNote(this.navParams.data.newcomerkey, key);
    this.editNoteKey.next("");
  }

  modifyNote(textArea: TextInput, key: string) {
    this.matchDb.modifyNote(this.navParams.data.newcomerkey, textArea.value, key);
    this.editNoteKey.next("");
  }

  editNote(note: any) {
    this.editNoteKey.next(note.key);
  }

  cancelNote() {
    this.editNoteKey.next("");
  }

}
