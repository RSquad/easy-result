import { Component } from '@angular/core';
import { TonService } from './ton.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'easy-rewards';
  addrContest: string = '';

  constructor(private tonService: TonService) {}

  async ngOnInit() {}

  async onSubmit() {
    await this.tonService.fetchContest(this.addrContest);
  }

  get contest() {
    return this.tonService.activeContestData;
  }
}
