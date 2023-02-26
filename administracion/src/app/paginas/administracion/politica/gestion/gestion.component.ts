import { Component, OnInit } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { PoliticaDialogoComponent } from './politica-dialogo/politica-dialogo.component';
import { PoliticaGuardar, PoliticaConsultar} from './gestion'
import { PoliticaService } from './gestion.service';
import { AsignarPoliticaComponent } from './asignar-politica/asignar-politica.component';
import { DatePipe } from '@angular/common';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { runInThisContext } from 'vm';
import { concat } from 'rxjs';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.component.html',
  styleUrls: ['./gestion.component.css']
})
export class GestionComponent{

  date = new Date()
  fecha = this._datePipe.transform(this.date, 'yyyy/MM/dd')
  politicaNuevaAux = new PoliticaGuardar('','',this.fecha)

  dataSource: MatTableDataSource<PoliticaConsultar>;
  displayedColumns = ['id', 'nombre', 'url','fecha', 'editar', 'eliminar', 'asignar'];

  constructor(
   private _dialogo : MatDialog,
   private _politicaService : PoliticaService,
   private _datePipe : DatePipe,
   private _notificacion : MatSnackBar,
   private translate: TranslateService
  ) { 
    this.consultarPoliticas()
  }

  consultarPoliticas(){
    this._politicaService.consultarPoliticas().subscribe(
      resultado => {
        this.dataSource = new MatTableDataSource(resultado),
        this.dataSource.filterPredicate = function(data, filter : string): boolean {
          return data.nombre.toLowerCase().includes(filter)
        }
      },
      () => {
        let mensaje = '';
          this.translate.stream("politica.gestion.error").subscribe((res: string)=>{
            mensaje = res;
          });
        this.notificacion(mensaje, "fracaso-snackbar", 4000)
      }
    )
  }

  nuevaPolitica(){
    const NuevaPolticaDiaologo = this._dialogo.open(PoliticaDialogoComponent,{
      width: '50%',
      height: 'fit-content',
      data:{
        politica: this.politicaNuevaAux,
        nuevo: true
      }
    })

    NuevaPolticaDiaologo.afterClosed().subscribe(
      () => this.consultarPoliticas()
    )
  }

  editarPolitica(politicaAux : PoliticaConsultar){
    const editarPoliticaDialogo = this._dialogo.open(PoliticaDialogoComponent, {
      width: '50%',
      height: 'fit-content',
      data:{
        politica: politicaAux,
        nuevo: false
      }
    })

    editarPoliticaDialogo.afterClosed().subscribe(
      () => this.consultarPoliticas()
    )
  }

  eliminarPolitica(politica : PoliticaConsultar){
    let mensaje = '';
      this.translate.stream("politica.gestion.conf_elimnar").subscribe((res: string)=>{
        mensaje = res;
      });
    if (confirm(mensaje)){
      this._politicaService.eliminarPolitica(politica.id).subscribe(
        respuesta => {
          this.notificacion(respuesta.mensaje, 'exito-snackbar')
          this.consultarPoliticas();
        },
        error =>  {
          this.notificacion(error.error.mensaje? error.error.mensaje : 'ERROR','fracaso-snackbar')
        }
      )
    }
   
  }

  asignarPolitica(politicaAux: PoliticaConsultar){
    const asignarPoliticaDialogo = this._dialogo.open(AsignarPoliticaComponent, {
      width: '40%',
      height: 'fit-content',
      data:{
        politica: politicaAux,
      }
    })

    asignarPoliticaDialogo.afterClosed().subscribe(
      () => this.consultarPoliticas()
    )
  }

  aplicarFiltro(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase()
  }

  notificacion(mensaje : string, estilo : string, duracion?:number){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: duracion | 2000,
      verticalPosition: 'top'
    })
  }
}
