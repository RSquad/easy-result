import { Component, OnInit } from '@angular/core';
import { TonService } from '../ton.service';

@Component({
  selector: 'app-contest',
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.sass'],
})
export class ContestComponent implements OnInit {
  constructor(private tonService: TonService) {}

  ngOnInit(): void {}

  get contest() {
    return this.tonService.activeContestData;
  }
}
