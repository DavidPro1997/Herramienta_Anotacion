import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Material } from '../material';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChecklistDatabase } from '../paginas/anotacion/tree-view-tratamientos/tree-view-tratamientos.component';

@NgModule({
  declarations: [
    TreeViewComponent
  ],
  imports: [
    CommonModule,
    Material,
    ReactiveFormsModule,
    RouterModule,
  ],
  providers:[
    ChecklistDatabase
  ],
  exports:[
    TreeViewComponent
  ]
})
export class MainNavModule { }
