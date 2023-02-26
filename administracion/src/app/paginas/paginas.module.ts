import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Material } from '../material';
import { PaginasComponent } from './paginas.component';
import { PaginasRoutingModule } from './paginas-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ConsolidacionComponent } from './consolidacion/consolidacion.component';
import { AnotacionComponent } from './anotacion/anotacion.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnotacionModule } from './anotacion/anotacion.module';
import { ConsolidacionModule } from './consolidacion/consolidacion.module';
import { TranslateModule} from '@ngx-translate/core';



@NgModule({
  declarations: [
    PaginasComponent,
    ConsolidacionComponent,
    AnotacionComponent,

  ],
  imports: [
    CommonModule,
    Material,
    PaginasRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AnotacionModule,
    ConsolidacionModule,
    TranslateModule,
  ],
  bootstrap:[PaginasComponent],
  providers:[]

})

export class PaginasModule { }

