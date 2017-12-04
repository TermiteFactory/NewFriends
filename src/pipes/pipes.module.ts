import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse/reverse';
import { HeadersPipe } from './headers/headers';
@NgModule({
	declarations: [ReversePipe,
    HeadersPipe],
	imports: [],
	exports: [ReversePipe,
    HeadersPipe]
})
export class PipesModule {}
