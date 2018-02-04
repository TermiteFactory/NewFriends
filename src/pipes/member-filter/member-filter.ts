import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the MemberFilterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'memberFilter',
})
export class MemberFilterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any[], arg1:string, ...args) {

    if (value == null) {
      //since the async is still working
      return [];
    }

    let output = []; 

    value.forEach(element => {
        if (element.auth == arg1) {
            output.push(element)
        }
    });

    return output;
  }
}
