import { NgModule } from '@angular/core';
import { BydateNewcomersComponent } from './bydate-newcomers/bydate-newcomers';
import { FormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';
import { ContactListComponent } from './contact-list/contact-list';

@NgModule({
	declarations: [BydateNewcomersComponent,
    ContactListComponent],
	imports: [
		FormsModule,
		IonicModule,
	],
	exports: [BydateNewcomersComponent,
    ContactListComponent]
})
export class ComponentsModule {}
