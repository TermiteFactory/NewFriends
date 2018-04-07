import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotificationSettingsPage } from './notification-settings';

@NgModule({
  declarations: [
    NotificationSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationSettingsPage),
  ],
})
export class NotificationSettingsPageModule {}
