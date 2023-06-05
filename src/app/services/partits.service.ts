import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartitInterface } from '../model/interfaces/partit.interface';
import { Observable, Subject } from 'rxjs';

import jsonPartits from '../../assets/data/partits.json';


@Injectable({
  providedIn: 'root'
})
export class PartitsService {

  partits$ = new Subject<PartitInterface[]>();

  constructor(
    private http: HttpClient
  ) {}

  loadPartits() {
    this.partits$.next(jsonPartits.sort((a, b) => {
      return a.vots >= b.vots ? -1 : 1;
    }));
  }
}
