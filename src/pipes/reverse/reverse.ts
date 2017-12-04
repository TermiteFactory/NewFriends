import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the ReversePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'reverse',
})
export class ReversePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any[], ...args) {
    if (value == null) {
      //since the async is still working
      return [];
    }
    return value.slice().reverse();
  }
}
