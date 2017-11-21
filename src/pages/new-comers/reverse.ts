import { Pipe } from '@angular/core';


@Pipe({
  name: 'reverse'
})
export class ReversePipe {
  transform(value) {
    if (value == null) //since the async is still working
      return [];
      
    return value.slice().reverse();
  }
}
