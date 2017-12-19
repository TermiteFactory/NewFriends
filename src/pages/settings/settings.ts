import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
import {App} from 'ionic-angular';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AlertController } from 'ionic-angular';
import { MatchstickDbProvider, Community } from '../../providers/matchstick-db/matchstick-db';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage implements OnDestroy {

  constructor(public navCtrl: NavController, public navParams: NavParams,public authData: AuthProvider, 
    public app: App, public alertCtrl: AlertController, public matchDb: MatchstickDbProvider) {
      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  logoutUser() {
    this.authData.logoutUser().then( () => {
      this.app.getRootNav().setRoot('LoginPage');
    });
  }

  communityPrompt() {
    let prompt = this.alertCtrl.create({
      title: 'Add Community',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name of Community'
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
          text: 'Add',
          handler: data => {
            this.addCommunity(data.name);
          }
        }
      ]
    });
    prompt.present();
  }

  addCommunity(name: string) {
    this.matchDb.addCommunity(name);
  }

  communityListPrompt() {
    let communityListSub: Subscription = this.matchDb.getCommunityList().subscribe( (list) => {
      if (list!=null) {
        let inputList = [];
        list.forEach((community) => {
          inputList.push({type: 'radio', label: community.name, value: community.key});
        })
        inputList.push({type: 'radio', label: 'Leave All', value: ""});
        let prompt = this.alertCtrl.create({
          title: 'Select a Community to Join',
          inputs: inputList,
          buttons: [
            {
              text: 'Cancel',
              handler: data => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Join',
              handler: data => {
                this.matchDb.setCommmunity(data);
              }
            }
          ]
        });
        prompt.present();
      }

      communityListSub.unsubscribe();
    });
  }

  ngOnDestroy() {
  }

}
