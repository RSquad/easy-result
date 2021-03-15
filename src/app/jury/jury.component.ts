import { Component, Input, OnInit } from '@angular/core';
import { RewardService } from '../reward.service';
import { cols } from './view-data';

@Component({
  selector: 'app-jury',
  templateUrl: './jury.component.html',
  styleUrls: ['./jury.component.sass'],
})
export class JuryComponent implements OnInit {
  @Input() jury!: any[];
  @Input() contestState!: any;
  cols = cols;
  activeJuryId = '';
  sort = {
    key: 'totalVotes',
    order: 'DESC',
  };
  rewards: any = {};

  constructor(private rewardService: RewardService) {}

  ngOnInit(): void {}

  onRewardChange(addrJury: string, e: any) {
    this.rewards[addrJury] = e.target.value;
    this.rewardService.juryRewards = this.rewards;
  }

  get sortedJury() {
    const result = this.jury.sort((a: any, b: any) => {
      if (this.sort.key === 'totalVotes') {
        if (a.votes.length > b.votes.length) return 1;
        if (a.votes.length < b.votes.length) return -1;
        return 0;
      }
      if (a[this.sort.key] > b[this.sort.key]) return 1;
      if (a[this.sort.key] < b[this.sort.key]) return -1;
      return 0;
    });
    return this.sort.order === 'ASC' ? result : result.reverse();
  }

  onTickClick(addrJury: string) {
    if (this.activeJuryId === addrJury) return (this.activeJuryId = '');
    return (this.activeJuryId = addrJury);
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
}
