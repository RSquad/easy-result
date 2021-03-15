import { Component, Input, OnInit } from '@angular/core';
import { TVote } from '../ton.service';

@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.sass'],
})
export class VotesComponent implements OnInit {
  @Input() votes!: TVote[];
  cols = [
    {
      key: 'type',
      title: 'Vote',
    },
    {
      key: 'addrJury',
      title: 'Jury',
    },
    {
      key: 'pkJury',
      title: 'Public key',
    },
    {
      key: 'comment',
      title: 'Comment',
    },
  ];
  sort = {
    key: 'type',
    order: 'DESC',
  };

  get sortedVotes() {
    const result = this.votes.sort((a: any, b: any) => {
      if (this.sort.key === 'type') {
        if (a[this.sort.key] === 'accept' && b[this.sort.key] !== 'accept')
          return 1;
        if (a[this.sort.key] !== 'accept' && b[this.sort.key] === 'accept')
          return -1;
        if (a[this.sort.key] === 'accept' && b[this.sort.key] === 'accept') {
          if (+a.points > +b.points) return 1;
          if (+a.points < +b.points) return -1;
          return 0;
        }
        if (a[this.sort.key] < b[this.sort.key]) return 1;
        if (a[this.sort.key] > b[this.sort.key]) return -1;
      }
      if (a[this.sort.key] > b[this.sort.key]) return 1;
      if (a[this.sort.key] < b[this.sort.key]) return -1;
      return 0;
    });
    return this.sort.order === 'ASC' ? result : result.reverse();
  }

  ngOnInit(): void {}

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
