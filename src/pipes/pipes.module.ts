import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse/reverse';
import { HeadersPipe } from './headers/headers';
import {TimeAgoPipe} from 'time-ago-pipe/time-ago-pipe';
@NgModule({
	declarations: [ReversePipe,
		HeadersPipe,
		TimeAgoPipe],
	imports: [],
	exports: [ReversePipe,
		HeadersPipe,
		TimeAgoPipe]
})
export class PipesModule {}
