import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';

import { NewComersPage } from '../pages/new-comers/new-comers';
import { ForMePage } from '../pages/for-me/for-me';
import { GroupsPage } from '../pages/groups/groups';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

import {ComponentsModule} from '../components/components.module'
import {PipesModule} from '../pipes/pipes.module'

import {AngularFireModule } from 'angularfire2'
import {AngularFireDatabaseModule} from 'angularfire2/database'
import {AngularFireAuthModule} from 'angularfire2/auth'

import { FCM } from '@ionic-native/fcm';
import { SMS } from '@ionic-native/sms';
import { CallNumber } from '@ionic-native/call-number';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { MatchstickDbProvider } from '../providers/matchstick-db/matchstick-db';
import { firebaseConfig } from './firebaseconfig';


@NgModule({
  declarations: [
    MyApp,
    NewComersPage,
    ForMePage,
    GroupsPage,
    SettingsPage,
    TabsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {tabsHideOnSubPages: true}),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    ComponentsModule,
    PipesModule,
    AngularFireAuthModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    NewComersPage,
    ForMePage,
    GroupsPage,
    SettingsPage,
    TabsPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FCM,
    SMS,
    CallNumber,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    MatchstickDbProvider
  ]
})
export class AppModule {}
