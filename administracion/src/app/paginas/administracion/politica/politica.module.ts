import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Material } from '../../../material';
import { MatDialog, MatDialogModule} from '@angular/material';
import { PoliticaRoutingModule } from './politica-routing.module';
import { PoliticaComponent } from './politica.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GestionComponent } from './gestion/gestion.component';
import { InsertarComponent } from './insertar/insertar.component';
import { InsertarDialogoComponent } from './insertar/insertar-dialogo/insertar-dialogo.component';
import { ConfirmacionDialogoComponent } from './insertar/confirmacion-dialogo/confirmacion-dialogo.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    PoliticaComponent,
    GestionComponent,
    InsertarComponent,
    InsertarDialogoComponent,
    ConfirmacionDialogoComponent,
  ],
  entryComponents:[
    InsertarDialogoComponent,
    ConfirmacionDialogoComponent,
  ],
  imports: [
    PoliticaRoutingModule,
    CommonModule,
    Material,
    HttpClientModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule,
    
  ],
  providers:[
    MatDialog,
    HttpClient,
    DatePipe,
  ]
})
export class PolticaModule { }
