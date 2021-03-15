import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contestState',
})
export class ContestStatePipe implements PipeTransform {
  transform(value: number): string {
    switch (value) {
      case 3:
        return 'Ended';
      case 2:
        return 'Voting';
      default:
        return 'Underway';
    }
  }
}
