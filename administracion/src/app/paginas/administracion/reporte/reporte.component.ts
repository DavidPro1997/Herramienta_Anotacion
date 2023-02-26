import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { Reportes, PoliticaAnotarConsultar} from './reporte'
import { PoliticaService } from './reporte.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";



@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent {

  reporte = new Reportes('',[]);
  politicasReporte: PoliticaAnotarConsultar[] = [];
  numRegistros: number = 0;
  dataSource: MatTableDataSource<PoliticaAnotarConsultar>;
  displayedColumns = ['id', 'nombre','usuario','tipo_usuario','fecha','anotaciones','escoger'];
  reporteFormulario: FormGroup 
  tipo = new FormControl("", [Validators.required]);
  formato = new FormControl("", [Validators.required]);
  checkbox: boolean = false;
  checkboxError: boolean = false;
  aux: boolean = false;
  archivo: File  = null;
  encabezado: boolean = false;

  constructor(
    private _politicaService : PoliticaService,
    private _notificacion : MatSnackBar,
    private translate: TranslateService
   ) {
      this.formulario();
   }

   private formulario(){
    this.reporteFormulario = new FormGroup({
      tipo: new FormControl('',[Validators.required]),
      formato: new FormControl('',[Validators.required]),
    });
   }

   aplicarFiltro(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase()
  }


  seleccionarTodo(check: boolean){
    if(check){
      this.dataSource.data.forEach(x=> x.escoger = true)
      this.politicasReporte = this.dataSource.data;
      this.checkboxError = false;
      this.checkbox = true;
    }
    else{
      this.dataSource.data.forEach(x=> x.escoger = false)
      this.politicasReporte = []
      this.checkboxError = true;
      this.checkbox = false;
    }
  }


  onChange(anotacion: any, isChecked: boolean) { 
    this.checkboxError=false;
    if(isChecked){
      this.politicasReporte.push(anotacion);  
      this.checkbox=true;
    }
    else{
      let indice = this.politicasReporte.indexOf(anotacion);
      this.politicasReporte.splice(indice, 1);
      if(this.politicasReporte.length==0){
        this.checkbox=false;
        this.checkboxError=true;
      } 
      else{
        this.checkbox=true;
        this.checkboxError=false;
      }
    } 
    if(this.politicasReporte.length==this.numRegistros){
      this.encabezado = true
    } 
    if(this.politicasReporte.length<this.numRegistros){
      this.encabezado = false;
    } 
  }

   consultarPoliticasAnotadas(tipo: number){
    this.checkbox = false;
    this.checkboxError=false;
    this.politicasReporte = [];
    this._politicaService.consultarPoliticasAnotadas(tipo).subscribe(
      resultado => {
        console.log(resultado)
        this.dataSource = new MatTableDataSource(resultado),
        this.dataSource.filterPredicate = function(data, filter : string): boolean {
          return data.nombre.toLowerCase().includes(filter)
        }
        this.numRegistros=this.dataSource.data.length;
        this.aux = true;
      },
      () => {
        let nota = '';
        this.translate.stream("reporte.error_politica").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota, "fracaso-snackbar", 4000)
      }
    )
  }

  notificacion(mensaje : string, estilo : string, duracion?:number){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: duracion | 2000,
      verticalPosition: 'top'
    })
  }

  desplegarPoliticasAnotadas(tipo: string){
    if (tipo == "noFinalizadas"){
      this.consultarPoliticasAnotadas(0);
    }
    else{
      this.consultarPoliticasAnotadas(1);
    }
  }

  formatoReporte(formato: string){
    this.reporte.formato=formato;
  }

  generarReporte(){
    if(this.politicasReporte.length==0 || this.errorAnotaciones()){
      this.errorCheckbox()
      this.checkboxError=true;
    }
    else{
      this.checkboxError=false;
      this.reporte.politicas = this.politicasReporte;
      console.log(this.reporte)
      this._politicaService.generarReporte(this.reporte).subscribe(
        respuesta => {
          let nota = '';
          this.translate.stream("reporte.exito").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, 'exito-snackbar')
          this.archivo=respuesta.archivo;
          console.log(this.archivo)
        },
        error =>  {
          this.notificacion(error.error.mensaje? error.error.mensaje : 'ERROR','fracaso-snackbar')
        }
        )
    }
  }

  errorFormato() {
    let nota = '';
    this.translate.stream("reporte.formato").subscribe((res: string)=>{
      nota = res;
    });
    return this.formato.hasError("required") ? nota : "";
  }

  errorTipo() {
    let nota = '';
    this.translate.stream("reporte.politica").subscribe((res: string)=>{
      nota = res;
    });
    return this.formato.hasError("required") ? nota : "";
  }

  errorCheckbox(){
    let nota = '';
    this.translate.stream("reporte.error_escoger").subscribe((res: string)=>{
      nota = res;
    });
    return this.formato.hasError("required") ? nota : "";
  }
  
  errorAnotaciones(){
    for (let element of this.politicasReporte){
      if (element.anotaciones==0){
        return true
      }
      else{
        return false
      }
    }
  }

}

