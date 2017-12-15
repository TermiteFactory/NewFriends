import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
import {App} from 'ionic-angular';
import firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';

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
export class SettingsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public authData: AuthProvider, public app: App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  logoutUser() {
    this.authData.logoutUser().then( () => {
      this.app.getRootNav().setRoot('LoginPage');
    });
  }

}
