import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse/reverse';
import { HeadersPipe } from './headers/headers';
import {TimeAgoPipe} from 'time-ago-pipe/time-ago-pipe';
import { MemberFilterPipe } from './member-filter/member-filter';
@NgModule({
	declarations: [ReversePipe,
		HeadersPipe,
		TimeAgoPipe,
    MemberFilterPipe],
	imports: [],
	exports: [ReversePipe,
		HeadersPipe,
		TimeAgoPipe,
    MemberFilterPipe]
})
export class PipesModule {}
