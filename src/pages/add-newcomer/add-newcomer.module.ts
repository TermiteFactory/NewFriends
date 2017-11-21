import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewcomerPage } from './add-newcomer';

@NgModule({
  declarations: [
    AddNewcomerPage,
  ],
  imports: [
    IonicPageModule.forChild(AddNewcomerPage),
  ],
})
export class AddNewcomerPageModule {}
