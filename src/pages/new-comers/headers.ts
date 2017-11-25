import { Pipe } from '@angular/core';


@Pipe({
  name: 'headers'
})
export class HeadersPipe {
  transform(value) {
    if (value == null) //since the async is still working
      return [];
      
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
