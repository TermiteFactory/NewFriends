import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssignNewcomerPage } from './assign-newcomer';

@NgModule({
  declarations: [
    AssignNewcomerPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignNewcomerPage),
  ],
})
export class AssignNewcomerPageModule {}
