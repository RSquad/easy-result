import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { TSubm, TonService } from './ton.service';
import { map } from 'rxjs/operators';

export type TResults = {
  places: any;
};

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  type = new BehaviorSubject<'points' | 'bool'>('points');
  threshold = new BehaviorSubject<{
    points: string;
    rejects: string;
    percent: string;
  }>({ points: '', rejects: '', percent: '' });

  results!: TResults;

  constructor(private tonService: TonService) {
    combineLatest([
      this.tonService.activeContestData,
      this.type,
      this.threshold,
    ])
      .pipe(
        map(([contest, type, threshold]) => {
          const places: any = {};
          if (type === 'points') {
            contest.subms
              .sort((a: TSubm, b: TSubm) => {
                if (+a.avgPoints < +b.avgPoints) return 1;
                if (+a.avgPoints > +b.avgPoints) return -1;
                return 0;
              })
              .filter((subm: TSubm, i: number) => {
                if (
                  (!threshold.points || +subm.avgPoints > +threshold.points) &&
                  (!threshold.rejects || +subm.rejects < +threshold.rejects) &&
                  (!threshold.percent ||
                    +subm.totalVotes * (+threshold.percent / 100) >
                      +subm.rejects)
                ) {
                  return true;
                } else {
                  places[subm.id] = 999999999;
                  return false;
                }
              })
              .forEach((subm: TSubm, i: number) => {
                places[subm.id] = i + 1;
              });
            return { places };
          } else {
            contest.subms
              .sort((a: TSubm, b: TSubm) => {
                if (+a.avgPoints < +b.avgPoints) return 1;
                if (+a.avgPoints > +b.avgPoints) return -1;
                return 0;
              })
              .forEach((subm: TSubm, i: number) => {
                if (
                  (!threshold.points || +subm.avgPoints > +threshold.points) &&
                  (!threshold.rejects || +subm.rejects < +threshold.rejects) &&
                  (!threshold.percent ||
                    +subm.totalVotes * (+threshold.percent / 100) >
                      +subm.rejects)
                ) {
                  places[subm.id] = 1;
                } else {
                  places[subm.id] = 999999999;
                }
              });
            return { places };
          }
        })
      )
      .subscribe((res) => {
        this.results = res;
      });
  }
}
