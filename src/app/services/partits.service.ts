import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PartitInterface } from '../model/interfaces/partit.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartitsService {

  partits$ = new Subject<PartitInterface[]>();

  constructor(private http: HttpClient) {
    this.http.get<PartitInterface[]>('../../assets/data/partits.json').subscribe((_partits) => {
      this.partits$.next(_partits);
    });
  }
}
