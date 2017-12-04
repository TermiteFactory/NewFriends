import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { NewComersPage } from '../pages/new-comers/new-comers';
import { ForMePage } from '../pages/for-me/for-me';
import { GroupsPage } from '../pages/groups/groups';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';

import {ComponentsModule} from '../components/components.module'
import {PipesModule} from '../pipes/pipes.module'

import {AngularFireModule } from 'angularfire2'
import {AngularFireDatabaseModule} from 'angularfire2/database'

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';

export const firebaseConfig = {
    apiKey: "AIzaSyAzZg3R8ulG2jfqAOlemmG9gZ_YeexvZhI",
    authDomain: "match-f21a7.firebaseapp.com",
    databaseURL: "https://match-f21a7.firebaseio.com",
    projectId: "match-f21a7",
    storageBucket: "match-f21a7.appspot.com",
    messagingSenderId: "770536684275"
};

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
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    ComponentsModule,
    PipesModule,
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
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider
  ]
})
export class AppModule {}
