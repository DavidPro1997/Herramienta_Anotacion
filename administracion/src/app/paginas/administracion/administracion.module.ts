import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TratamientoComponent } from './tratamiento/tratamiento.component';
import { Material } from '../../material';
import { MatDialog, MatDialogModule} from '@angular/material';
import { AdministracionRoutingModule } from './administracion-routing.module';
import { AdministracionComponent } from './administracion.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TratamientoDialogoComponent } from './tratamiento/tratamiento-dialogo/tratamiento-dialogo.component';
import { PaletaColoresComponent } from './tratamiento/tratamiento-dialogo/paleta-colores/paleta-colores.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
//import { PoliticaComponent } from './politica/politica.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { AtributoComponent } from './atributo/atributo.component';
import { ValorComponent } from './valor/valor.component';
import { AtributoDialogoComponent } from './atributo/atributo-dialogo/atributo-dialogo.component';
import { PoliticaDialogoComponent } from './politica/gestion/politica-dialogo/politica-dialogo.component';
import { UsuarioDialogoComponent } from './usuario/usuario-dialogo/usuario-dialogo.component';
import { ValorDialogoComponent } from './valor/valor-dialogo/valor-dialogo.component';
import { PrevisualizacionComponent } from './politica/gestion/previsualizacion/previsualizacion.component';
import { AsignarPoliticaComponent } from './politica/gestion/asignar-politica/asignar-politica.component';
//import { GestionComponent } from './politica/gestion/gestion.component';
//import { InsertarComponent } from './politica/insertar/insertar.component';
import { ReporteComponent } from './reporte/reporte.component';
import { InformacionComponent } from './politica/insertar/informacion/informacion.component';
//import { InsertarDialogoComponent } from './politica/insertar/insertar-dialogo/insertar-dialogo.component';
//import { ConfirmacionDialogoComponent } from './politica/insertar/confirmacion-dialogo/confirmacion-dialogo.component';
import { TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    AdministracionComponent,
    TratamientoComponent,
    TratamientoDialogoComponent,
    PaletaColoresComponent,
    //PoliticaComponent,
    UsuarioComponent,
    AtributoComponent,
    ValorComponent,
    AtributoDialogoComponent,
    PoliticaDialogoComponent,
    UsuarioDialogoComponent,
    ValorDialogoComponent,
    PrevisualizacionComponent,
    AsignarPoliticaComponent,
    //GestionComponent,
    //InsertarComponent,
    ReporteComponent,
    InformacionComponent,
    /*InsertarDialogoComponent,
    ConfirmacionDialogoComponent,*/
  ],
  entryComponents:[
    TratamientoDialogoComponent,
    PaletaColoresComponent,
    AtributoDialogoComponent,
    PoliticaDialogoComponent,
    PrevisualizacionComponent,
    UsuarioDialogoComponent,
    ValorDialogoComponent,
    AsignarPoliticaComponent,
    InformacionComponent,
    /*InsertarDialogoComponent,
    ConfirmacionDialogoComponent,*/
  ],
  imports: [
    AdministracionRoutingModule,
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
    DatePipe
  ]
})
export class AdministracionModule { }
