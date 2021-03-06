import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Host,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';

import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { toBoolean } from '../core/util/convert';
import { NzThComponent } from './nz-th.component';

import { NzTableComponent } from './nz-table.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector   : 'thead:not(.ant-table-thead)',
  templateUrl: './nz-thead.component.html'
})
export class NzTheadComponent implements AfterContentInit, OnDestroy {
  private _singleSort = false;
  private unsubscribe$ = new Subject<void>();

  @ViewChild('contentTemplate') template: TemplateRef<void>;
  @ContentChildren(NzThComponent, { descendants: true }) listOfNzThComponent: QueryList<NzThComponent>;
  @Output() nzSortChange = new EventEmitter<{ key: string, value: string }>();

  @Input()
  set nzSingleSort(value: boolean) {
    this._singleSort = toBoolean(value);
  }

  get nzSingleSort(): boolean {
    return this._singleSort;
  }

  constructor(@Host() @Optional() public nzTableComponent: NzTableComponent) {
    if (this.nzTableComponent) {
      this.nzTableComponent.nzTheadComponent = this;
    }
  }

  ngAfterContentInit(): void {
    let sortChange = new Subject<{ key: string, value: string }>().asObservable();
    const listOfTh = this.listOfNzThComponent.toArray();
    const sortChangeArray = listOfTh.map(th => th.nzSortChangeWithKey);
    if (sortChangeArray.length) {
      sortChangeArray.forEach(sort => {
        sortChange = merge(sort.asObservable(), sortChange);
      });
    }
    sortChange.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.nzSortChange.emit(data);
      if (this.nzSingleSort) {
        listOfTh.forEach(th => th.nzSort = (th.nzSortKey === data.key ? th.nzSort : null));
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
