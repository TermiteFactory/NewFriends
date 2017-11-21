import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewcomerDetailsPage } from './newcomer-details';

@NgModule({
  declarations: [
    NewcomerDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(NewcomerDetailsPage),
  ],
})
export class NewcomerDetailsPageModule {}
