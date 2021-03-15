import { Component, Input, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import { TSubm } from '../ton.service';
import { cols } from './view-data';
import { RewardService } from '../reward.service';

@Component({
  selector: 'app-subms',
  templateUrl: './subms.component.html',
  styleUrls: ['./subms.component.sass'],
})
export class SubmsComponent implements OnInit {
  @Input() subms!: TSubm[];
  @Input() contestState!: any;
  activeSubmId: string = '';
  cols = cols;
  sort = {
    key: 'id',
    order: 'DESC',
  };
  rewards: any = {};

  constructor(
    private settingsService: SettingsService,
    private rewardService: RewardService
  ) {}

  get type() {
    return this.settingsService.type.value;
  }

  get sortedSubms() {
    const result = this.subms.sort((a: any, b: any) => {
      if (this.sort.key === 'place') {
        if (+this.results.places[a.id] > +this.results.places[b.id]) return 1;
        if (+this.results.places[a.id] < +this.results.places[b.id]) return -1;
        return 0;
      }
      if (
        this.sort.key === 'id' ||
        this.sort.key === 'totalPoints' ||
        this.sort.key === 'avgPoints' ||
        this.sort.key === 'rejects' ||
        this.sort.key === 'abstains'
      ) {
        if (+a[this.sort.key] > +b[this.sort.key]) return 1;
        if (+a[this.sort.key] < +b[this.sort.key]) return -1;
        return 0;
      }
      if (a[this.sort.key] > b[this.sort.key]) return 1;
      if (a[this.sort.key] < b[this.sort.key]) return -1;
      return 0;
    });
    return this.sort.order === 'ASC' ? result : result.reverse();
  }
  get results() {
    return this.settingsService.results;
  }

  ngOnInit(): void {}

  onTickClick(submId: string) {
    if (this.activeSubmId === submId) return (this.activeSubmId = '');
    return (this.activeSubmId = submId);
  }

  onSortClick(key: string): void {
    if (key === this.sort.key) {
      if (this.sort.order === 'ASC') {
        this.sort.order = 'DESC';
      } else {
        this.sort.order = 'ASC';
      }
    } else {
      this.sort = {
        key,
        order: 'DESC',
      };
    }
  }

  onRewardChange(submId: string, e: any) {
    this.rewards[submId] = e.target.value;
    this.rewardService.submsRewards = this.rewards;
  }
}
