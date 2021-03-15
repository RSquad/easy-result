import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { TonService, TSubm } from './ton.service';
import * as XLSX from 'xlsx';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class RewardService {
  submsRewards: any = {};
  juryRewards: any = {};
  contest: any = {};

  constructor(
    private tonService: TonService,
    private settingsService: SettingsService
  ) {
    this.tonService.activeContestData
      .pipe(
        map((contest) => {
          return contest;
        })
      )
      .subscribe((res) => {
        this.contest = res;
      });
  }

  makeXls() {
    const subms: any = [];
    const juries: any = [];

    this.contest.subms.forEach((subm: TSubm) => {
      const row: any = [];
      row.push(subm.id);
      row.push(subm.addr);
      row.push(subm.avgPoints);
      row.push(
        this.settingsService.results.places[subm.id] == 999999999
          ? 'rejected'
          : this.settingsService.results.places[subm.id]
      );
      row.push(this.submsRewards[subm.id] || '0');
      row.push(subm.accepts);
      row.push(subm.abstains);
      row.push(subm.rejects);
      subms.push(row);
    });

    this.contest.juryMembers.forEach((jury: any, i: number) => {
      const row: any = [];
      row.push(i + 1);
      row.push(jury.addr);
      row.push(jury.totalVotes);
      row.push(this.juryRewards[jury.addr] || '0');
      row.push(jury.totalAccepts);
      row.push(jury.totalAbstains);
      row.push(jury.totalRejects);
      juries.push(row);
    });

    const res: any = [
      [this.contest.title],
      [],
      [],
      [],
      [
        'Submission №',
        'Wallet address',
        'Average score',
        'Ranking',
        'Reward',
        'Accepted',
        'Abstained',
        'Rejected',
      ],
      ...subms,
      [],
      [],
      [],
      ['Jury Rewards'],
      [],
      [
        'Jury №',
        'Wallet address',
        'Votes count',
        'Reward',
        'Accepted',
        'Abstained',
        'Rejected',
      ],
      ...juries,
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(res);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `contest-${this.contest.addr}.xlsx`);
  }
}
