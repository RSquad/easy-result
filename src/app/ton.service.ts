import { Injectable } from '@angular/core';
import { TonClient } from '@tonclient/core';
import { ReplaySubject } from 'rxjs';
import TonContract from 'src/ton/ton-contract';
import contestTonPackage from 'src/ton/ton-packages/contest.ton-package';
import { initTonClient } from 'src/ton/utils/ton-client';
import { hexToUtf8 } from 'src/utils/convert';

export type TSubm = {
  abstains: string;
  accepts: string;
  addr: string;
  appliedAt: number;
  avgPoints: string;
  fileLink: string;
  forumLink: string;
  id: string;
  rejects: string;
  totalPoints: string;
  totalVotes: string;
  votes: TVote[];
};

export type TVote = {
  addrJury: string;
  pkJury: string;
  comment: string;
  points?: string;
  type: 'accept' | 'abstain' | 'reject';
};

@Injectable({
  providedIn: 'root',
})
export class TonService {
  client: TonClient;
  smcContest: TonContract;

  activeContestData = new ReplaySubject<any>(1);

  constructor() {
    this.client = initTonClient();
    this.smcContest = new TonContract({
      client: this.client,
      name: 'Contest',
      tonPackage: contestTonPackage,
    });
  }

  updateContest(data: any) {
    this.activeContestData.next(data);
  }

  async fetchContest(addr: string) {
    if (addr !== this.smcContest.addr) {
      this.smcContest.addr = addr;
      this.smcContest.bocRef = '';
    }
    const functions: string[] = [
      'contestStartCountdown',
      'contestCountdown',
      'votingCountdown',
      'listContenders',
      'getContestInfo',
      'getContendersInfo',
      'resultsFinalized',
    ];
    const data: any = {};
    (
      await Promise.all(
        functions.map(async (functionName: string) => {
          return this.smcContest.run({
            functionName,
          });
        })
      )
    ).forEach((result) => {
      data[result.name] = result.value;
    });

    let subms: any = [];
    let juryMembers: any = [];

    data.listContenders.ids.forEach((submId: string, i: number) => {
      subms.push({
        id: submId,
        addr: data.listContenders.addresses[i],
        appliedAt: data.getContendersInfo.appliedAts[i] * 1000,
        fileLink: hexToUtf8(data.getContendersInfo.fileLinks[i]),
        forumLink: hexToUtf8(data.getContendersInfo.forumLinks[i]),
      });
    });

    data.getContestInfo.juryAddresses.forEach((addrJury: string, i: number) => {
      juryMembers.push({
        addr: addrJury,
        pk: data.getContestInfo.juryKeys[i],
      });
    });
    (
      await Promise.all(
        subms.map((subm: any) => this.fetchSubm(juryMembers, subm.id))
      )
    ).forEach((_subm: any) => {
      subms = subms.map((subm: any) => {
        if (subm.id === _subm.id) return { ...subm, ..._subm };
        return subm;
      });
    });

    juryMembers = juryMembers.map((jury: any) => {
      const votes: any = [];
      subms.forEach((subm: TSubm) => {
        subm.votes.forEach((vote: TVote) => {
          if (jury.addr === vote.addrJury) {
            votes.push(vote);
          }
        });
      });
      return {
        ...jury,
        votes,
        totalVotes: votes.length,
        totalAccepts: votes.reduce(
          (a: any, b: any) => +a + (b.type === 'accept' ? 1 : 0),
          0
        ),
        totalRejects: votes.reduce(
          (a: any, b: any) => +a + (b.type === 'abstain' ? 1 : 0),
          0
        ),
        totalAbstains: votes.reduce(
          (a: any, b: any) => +a + (b.type === 'reject' ? 1 : 0),
          0
        ),
      };
    });

    let state: any;
    if (Date.now() < Date.now() + data.contestCountdown.secondsLeft * 1000) {
      state = 1;
    }
    if (Date.now() < Date.now() + data.votingCountdown.secondsLeft * 1000) {
      state = 2;
    }
    if (Date.now() > Date.now() + data.votingCountdown.secondsLeft * 1000) {
      state = 3;
    }

    const res = {
      addr,
      start: Date.now() + data.contestStartCountdown.secondsLeft * 1000,
      voting: Date.now() + data.contestCountdown.secondsLeft * 1000,
      end: Date.now() + data.votingCountdown.secondsLeft * 1000,
      link: hexToUtf8(data.getContestInfo.link),
      title: hexToUtf8(data.getContestInfo.title),
      subms,
      juryMembers,
      state,
      totalSubms: subms.length,
      totalVotes: subms.reduce((a: any, b: any) => +a + +b.totalVotes, 0),
      totalAccepts: subms.reduce((a: any, b: any) => +a + +b.accepts, 0),
      totalRejects: subms.reduce((a: any, b: any) => +a + +b.rejects, 0),
      totalAbstains: subms.reduce((a: any, b: any) => +a + +b.abstains, 0),
    };

    this.updateContest(res);
  }

  async fetchSubm(juryMembers: any, submId: string) {
    const functions: string[] = [
      'getStatsFor',
      'getVotesPerJuror',
      'getTotalRatingFor',
    ];
    const data: any = {};
    (
      await Promise.all(
        functions.map(async (functionName: string) => {
          return this.smcContest.run({
            functionName,
            input: {
              id: submId,
            },
          });
        })
      )
    ).forEach((result) => {
      data[result.name] = result.value;
    });
    const votes: any = [];
    data.getVotesPerJuror.jurorsFor.forEach((addrJury: string, i: number) => {
      votes.push({
        addrJury,
        pkJury: juryMembers.find((jury: any) => jury.addr === addrJury).pk,
        comment: hexToUtf8(data.getVotesPerJuror.commentsFor[i]),
        points: data.getVotesPerJuror.marks[i],
        type: 'accept',
      });
    });
    data.getVotesPerJuror.jurorsAbstained.forEach(
      (addrJury: string, i: number) => {
        votes.push({
          addrJury,
          pkJury: juryMembers.find((jury: any) => jury.addr === addrJury).pk,
          comment: hexToUtf8(data.getVotesPerJuror.commentsAbstained[i]),
          type: 'abstain',
        });
      }
    );
    data.getVotesPerJuror.jurorsAgainst.forEach(
      (addrJury: string, i: number) => {
        votes.push({
          addrJury,
          pkJury: juryMembers.find((jury: any) => jury.addr === addrJury).pk,
          comment: hexToUtf8(data.getVotesPerJuror.commentsAgainst[i]),
          type: 'reject',
        });
      }
    );
    const result = {
      avgPoints: data.getVotesPerJuror.marks.length
        ? (
            data.getVotesPerJuror.marks.reduce(
              (a: string, b: string) => +a + +b,
              0
            ) / data.getVotesPerJuror.marks.length
          ).toFixed(4)
        : '0',
      totalPoints: data.getStatsFor.totalPoints,
      totalVotes: data.getStatsFor.jurorsVoted,
      abstains: data.getStatsFor.abstained,
      accepts: data.getStatsFor.accepted,
      rejects: data.getStatsFor.rejected,
      votes,
      id: submId,
    };
    return result;
  }
}
