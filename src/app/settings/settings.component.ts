import { Component, OnInit } from '@angular/core';
import { RewardService } from '../reward.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass'],
})
export class SettingsComponent implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private rewardService: RewardService
  ) {}

  points = '5';
  rejects = '10';
  percent = '50';

  get type() {
    return this.settingsService.type.value;
  }
  get threshold() {
    return this.settingsService.threshold.value;
  }

  ngOnInit(): void {
    this.onThresholdChange();
  }

  onXlsClick() {
    this.rewardService.makeXls();
  }

  onTypeClick() {
    this.settingsService.type.next(this.type === 'points' ? 'bool' : 'points');
  }
  onThresholdChange() {
    const res = {
      points: this.points,
      rejects: this.rejects,
      percent: this.percent,
    };
    this.settingsService.threshold.next(res);
  }
}
