import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditNewcomerPage } from './edit-newcomer';
import { ElasticModule } from 'ng-elastic';

@NgModule({
  declarations: [
    EditNewcomerPage,
  ],
  imports: [
    IonicPageModule.forChild(EditNewcomerPage),
    ElasticModule,
  ],
})
export class EditNewcomerPageModule {}
