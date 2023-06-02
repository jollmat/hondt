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
    this.partits$.next(jsonPartits);
  }

  getPartits(): Observable<any> {
    return this.http.get('https://infoelectoral.interior.gob.es/min/estadisticas?tipoConvocatoria=4&idConvocatoria=201905&codCCAA=9&codProvincia=8&codMunicipio=270');
  }
}
