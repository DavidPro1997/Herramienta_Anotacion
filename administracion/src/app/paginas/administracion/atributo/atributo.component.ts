import { Component, OnInit } from '@angular/core';
import { Atributo } from './atributo';
import { TratamientoConsultar } from '../tratamiento/tratamiento'
import { TratamientoService } from '../tratamiento/tratamiento.service'
import { AtributoService } from './atributo.service'
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatDialog, MatSnackBar } from '@angular/material';
import { AtributoDialogoComponent } from './atributo-dialogo/atributo-dialogo.component';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-atributo',
  templateUrl: './atributo.component.html',
  styleUrls: ['./atributo.component.css'],
  providers: [AtributoService]
})

export class AtributoComponent implements OnInit {

  displayedColumns = ['id', 'descripcion', 'color_primario', 'editar', 'eliminar']
  atributos: Atributo[];
  atributo: Atributo;
  error: any;
  headers: string[];

  tratamientoControl = new FormControl('', [Validators.required]);
  selectFormControl = new FormControl('', Validators.required);
  tratamientos: TratamientoConsultar[] = [];

  atributoAux : Atributo = {
    id: 0,
    descripcion: '',
    color_primario: '',
    tratamiento_id: 0
  }

  tratamientoSeleccionado : TratamientoConsultar;
  botonNuevoDeshabilitado : Boolean;

  constructor(
    private readonly _tratamientoService: TratamientoService,
    private readonly _atributoService: AtributoService,
    private _notificacion : MatSnackBar,
    private _dialogo : MatDialog,
    private translate: TranslateService
  ) { }

  //DIALOGOS
  editarAtributo(atributoAux: Atributo){
    const dialogoEditar = this._dialogo.open(AtributoDialogoComponent,{
      width:'40%',
      height:'fit-content',
      data:{
        atributo: atributoAux,
        nuevo:false
      }
    })

    dialogoEditar.afterClosed().subscribe(
      ()=> this.consultarAtributosTratamiento(this.tratamientoSeleccionado.id)
    )
  }

  nuevoAtributo(){
    this.atributoAux.tratamiento_id = this.tratamientoSeleccionado.id
    const dialogoNuevo = this._dialogo.open(AtributoDialogoComponent,{
      width:'40%',
      height:'fit-content',
      data:{
        atributo: this.atributoAux,
        nuevo:true
      }
    })

    dialogoNuevo.afterClosed().subscribe(
      () => this.consultarAtributosTratamiento(this.tratamientoSeleccionado.id)
    )

  }

  //FIN DIALOGOS 

  eliminarAtributo(atributoId : number){
    let mensaje = '';
          this.translate.stream("atributo.eliminar.confirmar").subscribe((res: string)=>{
            mensaje = res;
      });
    if (confirm(mensaje)){
      this._atributoService.eliminarAtributo(atributoId).subscribe(
        ()=> {
          let nota = '';
          this.translate.stream("atributo.eliminar.exito").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "exito-snackbar"),
          this.consultarAtributosTratamiento(this.tratamientoSeleccionado.id)
        }, 
        () => {
          let nota = '';
          this.translate.stream("atributo.eliminar.error").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "fracaso-snackbar")
        }
      )
    }
  }

  consultarTratamientos() {
    this._tratamientoService.obtenerTratamientos().subscribe(
      result => {this.tratamientos = result})
  }

  consultarAtributosTratamiento(tratamiento_id : number){
    return this._atributoService.obtenerAtributosTratamiento(tratamiento_id).subscribe(
      (resultado) => this.atributos = resultado),
      error => this.error = error;
  }

  vaciarTratamientoSeleccionado(){
    this.tratamientoSeleccionado = undefined;
    this.botonNuevoDeshabilitado = true;
    this.vaciarAtributos();
  }

  vaciarAtributos() {
    this.atributos = [];
  }

  seleccionarAtributos(tratamiento: TratamientoConsultar) {
    this.tratamientoSeleccionado = tratamiento;
    this.botonNuevoDeshabilitado = false;
    this.vaciarAtributos();
    this.consultarAtributosTratamiento(tratamiento.id);
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }


  ngOnInit() {
    this.consultarTratamientos();
    this.botonNuevoDeshabilitado = true;
  }
}
