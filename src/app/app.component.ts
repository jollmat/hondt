import { Component, OnInit } from '@angular/core';
import { PartitInterface } from './model/interfaces/partit.interface';
import { PartitsService } from './services/partits.service';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  STORED_HONDT_DATA: string = 'HONDT_DATA';
  STORED_HONDT_DATA_VERSION: string = 'STORED_HONDT_DATA_VERSION';
  STORED_HONDT_DATA_EN_BLANC: string = 'STORED_HONDT_DATA_EN_BLANC';

  title: string = 'Escrutini/resultats eleccions';

  showConfig: boolean = true;
  percentExclusio: number = 5;
  votsEnBlanc: number = 159;

  partitsUpdate$ = new Subject<string>();
  partits!: PartitInterface[];
  regidors: number = 21;
  partitsGovern: PartitInterface[] = [];
  partitsOposicio: PartitInterface[] = [];

  expanded: number[] = [];

  hondtData: {sigles: string, data: number[]}[] = [];
  hondtDataRank: {sigles: string, vots: number}[] = [];

  dragDropSubs = new Subscription();

  vista: 'ESCRUTINI' | 'PACTOMETRE' = 'ESCRUTINI';

  constructor(
    private partitsService: PartitsService,
    private dragulaService: DragulaService){
    this.partitsUpdate$.pipe(
      debounceTime(600),
      distinctUntilChanged())
      .subscribe(value => {
        this.calculateHondt();
      });

    this.dragDropSubs.add(this.dragulaService.drop("PARTITS")
      .subscribe(({ name, el, target, source, sibling }) => {
       localStorage.setItem(this.STORED_HONDT_DATA, JSON.stringify(this.partits));
      })
    );
  }

  sortBy(attr: string) {
    this.partits = this.partits.sort((a, b) => {
      if(attr==='nom'){
        return a.nom>=b.nom ? 1 : -1;
      } else {
        return a.vots>=b.vots ? -1 : 1;
      }
    });
    localStorage.setItem(this.STORED_HONDT_DATA, JSON.stringify(this.partits));
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
    vots+=this.votsEnBlanc;
    this.partits.forEach((_partit) => {
      vots+=Number(_partit.vots);
    });
    return vots;
  }

  updatePartits() {
    localStorage.setItem(this.STORED_HONDT_DATA, JSON.stringify(this.partits));
    localStorage.setItem(this.STORED_HONDT_DATA_EN_BLANC, JSON.stringify(this.votsEnBlanc));
    this.partitsUpdate$.next(JSON.stringify(this.partits));
    this.calculateHondt();
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
        if (partit && partit.vots>=((5*this.getTotalVots())/100)) {
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
    console.log('ngOnInit');
    const storedDataStr: string | null = localStorage.getItem(this.STORED_HONDT_DATA);
    const storedDataEnBlancStr: string | null = localStorage.getItem(this.STORED_HONDT_DATA_EN_BLANC);
    const storedVersion: string | null = localStorage.getItem(this.STORED_HONDT_DATA_VERSION);

    

    if (storedVersion && parseInt(storedVersion)===environment.version && (storedDataStr && storedDataStr.length>0)) {
       this.partits = JSON.parse(storedDataStr) as PartitInterface[];
       console.log(this.partits);

       if(!storedDataEnBlancStr) {
        localStorage.setItem(this.STORED_HONDT_DATA_EN_BLANC, this.votsEnBlanc.toString());
      }
      this.votsEnBlanc = (storedDataEnBlancStr) ? parseInt(storedDataEnBlancStr) : this.votsEnBlanc;

       this.configHondtMatrix();
       this.calculateHondt();
    } else {
      this.partitsService.partits$.subscribe((_partits) => {
        this.partits = _partits;
        localStorage.setItem(this.STORED_HONDT_DATA, JSON.stringify(this.partits));
        localStorage.setItem(this.STORED_HONDT_DATA_VERSION, JSON.stringify(environment.version));
        console.log(this.partits);

        if(!storedDataEnBlancStr) {
          localStorage.setItem(this.STORED_HONDT_DATA_EN_BLANC, this.votsEnBlanc.toString());
        }
        this.votsEnBlanc = (storedDataEnBlancStr) ? parseInt(storedDataEnBlancStr) : this.votsEnBlanc;

        this.configHondtMatrix();
        this.calculateHondt();
      });
      this.partitsService.loadPartits();
    }    
  }
}
