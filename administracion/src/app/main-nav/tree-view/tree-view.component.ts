import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Modulo} from './tree-view';
import {TranslateService} from "@ngx-translate/core";


interface ExampleFlatNode {
  expandable: boolean;
  nombre: string;
  level: number;
}

@Component({
  selector: 'app-tree-view',
  templateUrl: 'tree-view.component.html',
  styleUrls: ['tree-view.component.css'],
})
export class TreeViewComponent {

  @Input() modulos : Modulo[] = [];

  private _transformer = (node: Modulo, level: number) => {
    return {
      expandable: !!node.hijos && node.hijos.length > 0,
      nombre: node.nombre,
      level: level,
      icono: node.icono,
      path: node.path
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this._transformer, node => node.level, node => node.expandable, node => node.hijos);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private translate: TranslateService
    ) {
      this.dataSource.data = this.modulos;    
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit(): void {
    this.dataSource.data = this.modulos;
  }

}
