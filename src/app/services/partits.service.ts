import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartitInterface } from '../model/interfaces/partit.interface';
import { Subject } from 'rxjs';

import jsonPartits from '../../assets/data/partits.json';


@Injectable({
  providedIn: 'root'
})
export class PartitsService {

  partits$ = new Subject<PartitInterface[]>();

  constructor() {}

  loadPartits() {
    this.partits$.next(jsonPartits);
  }
}
