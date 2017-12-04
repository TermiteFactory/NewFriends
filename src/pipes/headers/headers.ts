import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the HeadersPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'headers',
})
export class HeadersPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any[], ...args) {
    if (value == null) {
      //since the async is still working
      return [];
    }

    let output = []; 
    let currentDate = "";

    value.forEach(element => {
        if (currentDate != element.date) {
            output.push({header: true, title: element.date})
            currentDate = element.date;
        }
        output.push(element)
    });

    return output;
  }
}
