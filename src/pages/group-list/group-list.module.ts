import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupListPage } from './group-list';
import {ComponentsModule} from '../../components/components.module'

@NgModule({
  declarations: [
    GroupListPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupListPage),
    ComponentsModule,
  ],
})
export class GroupListPageModule {}