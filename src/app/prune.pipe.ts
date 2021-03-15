import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prune',
})
export class PrunePipe implements PipeTransform {
  transform(value: string): string {
    if (value.substr(1, 1) === ':' || value.substr(0, 2) === '0x') {
      return `${value.substr(0, 5)}...${value.substr(-3, 3)}`;
    }
    return `${value.substr(0, 3)}...${value.substr(-3, 3)}`;
  }
}
