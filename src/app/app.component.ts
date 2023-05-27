import { Component, OnInit } from '@angular/core';
import { PartitInterface } from './model/interfaces/partit.interface';
import { PartitsService } from './services/partits.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'Escrutini/resultats eleccions';

  partitsUpdate$ = new Subject<string>();
  partits!: PartitInterface[];
  regidors: number = 21;

  expanded: number[] = [];

  hondtData: {sigles: string, data: number[]}[] = [];
  hondtDataRank: {sigles: string, vots: number}[] = [];

  constructor(private partitsService: PartitsService){
    this.partitsUpdate$.pipe(
      debounceTime(600),
      distinctUntilChanged())
      .subscribe(value => {
        this.calculateHondt();
      });
  }

  toggleExpanded(idx: number) {
    if (this.expanded.includes(idx)) {
      this.expanded = this.expanded.filter((_idx) => _idx!==idx );
    } else {
      this.expanded.push(idx);
    }
  }

  getTotalVots() {
    let vots: number = 0;
    this.partits.forEach((_partit) => {
      vots+=Number(_partit.vots);
    });
    return vots;
  }

  updatePartits() {
    this.partitsUpdate$.next(JSON.stringify(this.partits));
  }

  getNumRegidors(partit: PartitInterface) {
    if (this.hondtDataRank.length===0) {
      return 0;
    }
    const topRank: {sigles: string, vots: number}[] = this.hondtDataRank.slice(0, this.regidors);
    return topRank.filter((_partitRank) => _partitRank.sigles===partit.sigles ).length;
  }

  getNumRegidorsEnumeration(count: number) {
    return Array(count).fill(0).map((x,i)=>i);
  }

  private configHondtMatrix() {
    this.partits.forEach((_partit) => {
      let partitData: number[] = [];
      for(let i=0;i<this.regidors;i++){
        partitData.push(0);
      }
      this.hondtData.push({
        sigles: _partit.sigles,
        data: partitData
      });
    });
  }

  calculateHondt() {
    console.log('Calculating Hondt data!', this.hondtData);
    this.hondtDataRank = [];
    if(this.getTotalVots()>0) {
      this.hondtData.forEach((_hondtPartit) => {
        const partit: PartitInterface | undefined = this.partits.find((_partit) => _partit.sigles===_hondtPartit.sigles );
        if (partit) {
          for(let i=0;i<this.regidors;i++) {
            const vots: number = partit.vots/(i+1);
            _hondtPartit.data[i] = vots;
            this.hondtDataRank.push({
              sigles: partit.sigles,
              vots: vots
            });
          }
        }
      });
      this.hondtDataRank = this.hondtDataRank.sort((a, b) => {
        return a.vots>=b.vots ? -1 : 1;
      });

      console.log('hondtData', this.hondtData);
      console.log('hondtDataRank', this.hondtDataRank);
    }
  }

  ngOnInit(): void {
    this.partitsService.partits$.subscribe((_partits) => {
      this.partits = _partits;
      this.configHondtMatrix();
    });
    this.partitsService.loadPartits();
  }
}
