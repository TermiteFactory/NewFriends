import { NgModule } from '@angular/core';
import { BydateNewcomersComponent } from './bydate-newcomers/bydate-newcomers';
import { FormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';

@NgModule({
	declarations: [BydateNewcomersComponent],
	imports: [
		FormsModule,
		IonicModule,
	],
	exports: [BydateNewcomersComponent]
})
export class ComponentsModule {}
