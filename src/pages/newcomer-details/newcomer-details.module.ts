import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewcomerDetailsPage } from './newcomer-details';
import {PipesModule} from '../../pipes/pipes.module'

@NgModule({
  declarations: [
    NewcomerDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(NewcomerDetailsPage),
    PipesModule,
  ],
})
export class NewcomerDetailsPageModule {}
