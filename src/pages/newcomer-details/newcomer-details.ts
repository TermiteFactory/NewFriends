import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, TextInput, LoadingController } from 'ionic-angular';
import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { MatchstickDbProvider, DetailedData, SummaryDataKey, FollowConfig, GroupConfig } from '../../providers/matchstick-db/matchstick-db';
import { Summary } from '@angular/compiler';

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
  summary: SummaryDataKey = new SummaryDataKey;
  notes: any[] = [];
  editNoteKey: BehaviorSubject<string>;
  config: FollowConfig[];
  groupsconfig: GroupConfig[];
  groups: any[] = [];

  detailSub: Subscription;
  notesSub: Subscription;
  summarySub: Subscription;
  subConfig: Subscription;
  subGroups: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public matchDb: MatchstickDbProvider,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public authData: AuthProvider) {

      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      loading.present();

      let detailRtn: boolean = false;
      let notesRtn: boolean = false;
      let summaryRtn: boolean = false;
      let configRtn: boolean = false;
      let groupRtn: boolean = false;

      let checkAndDismiss = () => {
        if (detailRtn==true && summaryRtn==true && configRtn==true && notesRtn==true && groupRtn==true) {
          this.processGroups();
          if (loading!=null) {
            loading.dismiss();
            loading = null;
          }
        }
      }

      this.detailSub = this.matchDb.getDetailed(navParams.data.newcomerkey).subscribe( data => {
        if (data!=null) {
          this.local_data = data; 
          detailRtn = true;
          checkAndDismiss();
        }
      });
      this.notesSub = this.matchDb.getNotes(navParams.data.newcomerkey).subscribe( data => {
        if (data != null) {
          this.notes = data;
          notesRtn = true;
          checkAndDismiss();
        }
      });

      this.summarySub = this.matchDb.getSummary(navParams.data.summarykey).subscribe( data => {
        if (data != null) {
          this.summary = data;
          summaryRtn = true;
          checkAndDismiss();
        }
      });

      this.subConfig = matchDb.getFollowupConfig().subscribe( (c) => {
        if (c != null) {
          this.config = c;
          configRtn = true;
          checkAndDismiss();
        }
      });

      this.subGroups = matchDb.getGroupsConfig().subscribe( (g) => {
        if (g != null) {
          this.groupsconfig = g;
          groupRtn = true;
          checkAndDismiss();
        }
      });

      this.editNoteKey = new BehaviorSubject("");
  }

  processGroups() {
    this.groups = [];
    this.groupsconfig.forEach( (gconfig) => {
      if( this.local_data.groups!=undefined && this.local_data.groups[gconfig.key] == true) {
        this.groups.push({desc: gconfig.desc});
      }
    });
  }

  getFollowupState(): string {
    if (this.config!=null && this.summary!=null) {
      let displayText = '';
      let found = false;
      let defaultText = ''
      this.config.forEach(element => {
        if (this.summary.followup_state == element.key) {
          displayText = element.desc;
          found = true;
        }
        if (element.default==true) {
          defaultText = element.desc;
        }
      });
      if (!found) {
        displayText = defaultText;
      }
      return displayText;
    }
    else 
    {
      return '';
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewcomerDetailsPage');
  }

  editNewcomer() {
    this.navCtrl.push("EditNewcomerPage", { newcomerkey: this.navParams.data.newcomerkey, 
                                            summarykey: this.navParams.data.summarykey });
  }

  editAssignment() {
    this.navCtrl.push("AssignNewcomerPage", { summarykey: this.navParams.data.summarykey,
                                              name: this.summary.name,
                                              current: this.summary.followup_name});
  }

  editStatus() {
    this.navCtrl.push("AssignStatusPage", { summarykey: this.navParams.data.summarykey,
                                            name: this.summary.name,
                                            current: this.summary.followup_name});
  }

  ngOnDestroy() {
    this.detailSub.unsubscribe();
    this.notesSub.unsubscribe();
    this.summarySub.unsubscribe();
    this.subConfig.unsubscribe();
    this.subGroups.unsubscribe();
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
