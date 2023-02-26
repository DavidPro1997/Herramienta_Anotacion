import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreeViewCheckComponent, ChecklistDatabase } from './tree-view-tratamientos/tree-view-tratamientos.component';

import {MatNativeDateModule} from '@angular/material/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Material } from 'src/app/material';
import { SeleccionarTextoComponent } from './seleccionar texto/seleccionar-texto.component';
import { AnotacionPoliticaComponent } from './anotacion-politica/anotacion-politica.component';
import { ComentarioAnotacionComponent } from './comentario-anotacion/comentario-anotacion.component';
import { VisualizarAnotacionesComponent } from './visualizar-anotaciones/visualizar-anotaciones.component';
import { NotificacionIncosistenciaComponent } from './notificacion-incosistencia/notificacion-incosistencia.component';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    TreeViewCheckComponent,
    SeleccionarTextoComponent,
    AnotacionPoliticaComponent,
    ComentarioAnotacionComponent,
    VisualizarAnotacionesComponent,
    NotificacionIncosistenciaComponent
  ],
  imports: [
    CommonModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    Material,
    TranslateModule,
  ],
  entryComponents: [
    ComentarioAnotacionComponent,
    VisualizarAnotacionesComponent,
    NotificacionIncosistenciaComponent
  ],
  providers: [ChecklistDatabase],
  exports:[
    TreeViewCheckComponent,
    SeleccionarTextoComponent
  ]
})
export class AnotacionModule { }
