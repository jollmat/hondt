import { Component, OnInit } from '@angular/core';
import { PartitInterface } from './model/interfaces/partit.interface';
import { PartitsService } from './services/partits.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'Escrutini/resultats eleccions';

  partits!: PartitInterface[];

  expanded: number[] = [];

  constructor(private partitsService: PartitsService){}

  toggleExpanded(idx: number) {
    if (this.expanded.includes(idx)) {
      this.expanded = this.expanded.filter((_idx) => _idx!==idx );
    } else {
      this.expanded.push(idx);
    }
  }

  ngOnInit(): void {
    this.partitsService.partits$.subscribe((_partits) => {
      this.partits = _partits;
    });
  }
}
