import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewcomerDetailsPage } from './newcomer-details';
import {PipesModule} from '../../pipes/pipes.module'
import { ElasticModule } from 'ng-elastic';

@NgModule({
  declarations: [
    NewcomerDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(NewcomerDetailsPage),
    PipesModule,
    ElasticModule,
  ],
})
export class NewcomerDetailsPageModule {}
