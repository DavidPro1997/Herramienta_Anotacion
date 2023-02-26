import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TratamientoDialogoComponent } from './tratamiento-dialogo/tratamiento-dialogo.component';
import { TratamientoService } from './tratamiento.service';
import { TratamientoConsultar } from './tratamiento';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-tratamiento',
  templateUrl: './tratamiento.component.html',
  styleUrls: ['./tratamiento.component.css']
})
export class TratamientoComponent {

  tratamientoAux = new TratamientoConsultar(null, null, 0,null);

  displayedColumns = ['id', 'descripcion', 'color_primario', 'editar', 'eliminar'];
  listaTratamientos: MatTableDataSource<TratamientoConsultar>;

  constructor(
    private _dialogo: MatDialog,
    private _tratamientoService: TratamientoService,
    private _notificacion : MatSnackBar,
    private translate: TranslateService,
    ) {
      this.consultarTratamientos();
    }


  editarTratamiento(tratatamientoEditar: any) {
    const dialogoEditar = this._dialogo.open(TratamientoDialogoComponent, {
      width: '40%',
      height: 'fit-content',
      data: {
        tratamientoAux: tratatamientoEditar,
        nuevo: false
      }
    });

    dialogoEditar.afterClosed().subscribe(
      () => this.consultarTratamientos()
    )
  }

  nuevoTratamientoDialogo() {
    const dialogoNuevo = this._dialogo.open(TratamientoDialogoComponent, {
      width: '40%',
      height: 'fit-content',
      data: {
        tratamientoAux: this.tratamientoAux,
        nuevo: true
      }
    })

    dialogoNuevo.afterClosed().subscribe(
      () => this.consultarTratamientos()
    )
  }

  eliminarTratamiento(tratamientoId : number){
    let mensaje = '';
      this.translate.stream("tratamiento.eliminar.confirmar").subscribe((res: string)=>{
        mensaje = res;
      });
    if (confirm(mensaje)){
      this._tratamientoService.eliminarTratamiento(tratamientoId).subscribe(
        () => {
          let nota = '';
          this.translate.stream("tratamiento.eliminar.exito").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "exito-snackbar")
          this.consultarTratamientos()
        },
        () => {
          let nota = '';
          this.translate.stream("tratamiento.eliminar.error").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "fracaso-snackbar")
        }
      )
    }
    
  }

  aplicarFiltro(valor: string) {
    this.listaTratamientos.filter = valor.trim().toLowerCase()
  }

  consultarTratamientos() {
    this._tratamientoService.obtenerTratamientos().subscribe(
      (tratamientos : TratamientoConsultar[]) => {
        this.listaTratamientos = new MatTableDataSource(tratamientos)
        this.listaTratamientos.filterPredicate = function(data, filter : string): boolean {
          return data.descripcion.toLowerCase().includes(filter)
        }
      },
      () => {
        let nota = '';
          this.translate.stream("tratamiento.error").subscribe((res: string)=>{
            nota = res;
          });
        alert(nota)
      }

    )
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }
}

