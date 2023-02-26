import { Component, Inject } from "@angular/core";
import { InformacionComponent } from "./informacion/informacion.component";
import { InsertarDialogoComponent } from "./insertar-dialogo/insertar-dialogo.component";
import { MatDialog, MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';
import { PoliticaGuardar,RespuestaPoliticaVisualizar} from './insertar';
import { DOCUMENT } from "@angular/common";
import { PoliticaService } from '../insertar/insertar.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "app-insertar",
  templateUrl: "./insertar.component.html",
  styleUrls: ["./insertar.component.css"],
})

export class InsertarComponent {

  archivoPolitica: File = null;
  nombreArchivo = "";
  archivoEscogido: boolean = false;
  mensaje: string;
  numero: number;
  numUrl: number;
  aux: string;
  showSpinner = false;
  

  date = new Date()
  fecha = this._datePipe.transform(this.date, 'yyyy/MM/dd')
  politicaNuevaAux = new PoliticaGuardar('','',this.fecha,'')
 
  constructor(public dialog : MatDialog, 
    private _datePipe : DatePipe,
    @Inject(DOCUMENT) private documento: Document,  
    private _politicaService : PoliticaService,  
    private _notificacion : MatSnackBar,
    private translate: TranslateService
  ) {
    this.numUrl=0;
  }

  informacion (tipo: boolean): void{
    const dialogRef = this.dialog.open(InformacionComponent,{
      data: tipo
      });
    dialogRef.afterClosed().subscribe(res=>{console.log(res)});
  }

  public extraer(): void{
    this.numUrl = this.numUrl+1;
    if (this.numUrl<=this.numero){
      let mensaje = '';
          this.translate.stream("politica.insertar.espere").subscribe((res: string)=>{
            mensaje = res;
      });
      this.notificacion(mensaje,'advertencia-snackbar')
      this.showSpinner= true;
      this.archivoEscogido = false;
      this._politicaService.extraerTexto(this.numUrl).subscribe(
        resultado => {
          this.aux = resultado.estado;
          let nota = '';
          if(this.aux=='exito'){ 
            this.showSpinner=false;
            this.archivoEscogido = true;
            this.translate.stream("politica.insertar.notf_extraer").subscribe((res: string)=>{
            nota = res;
            });
            this.notificacion(nota,'exito-snackbar')   
            this.dialogoPrevisualizar(resultado.texto_politica, resultado.url);
          }
          else{
            this.showSpinner=false;
            this.archivoEscogido = false;
            this.translate.stream("politica.insertar.notf_error_extraer").subscribe((res: string)=>{
            nota = res;
            });
            this.notificacion(nota,'fracaso-snackbar')   
            this.numUrl=0;
          }
          
        },
        error => {
          this.showSpinner=false;
          this.archivoEscogido = false;
          let nota = '';
          this.translate.stream("politica.insertar.notf_error_extraer").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota,'fracaso-snackbar')
          this.numUrl=0;
        })
      }
      else{
        let nota = '';
        this.translate.stream("politica.insertar.no_url").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota,'exito-snackbar')   
      }
    }

    dialogoPrevisualizar(texto_politica: string, url: string) {
      const dialogRef = this.dialog.open(InsertarDialogoComponent, {
        width: "50%",
        height: "fit-content",
        maxHeight: "80%",
        data: {
          texto: texto_politica,
          url: url,
        }
      });
  
      dialogRef.afterClosed().subscribe(
        result => {
          if(result==1){
            this.extraer();
          }
          else{
            this.numUrl=0;
          }          
        }
      )
    }

  escogerArchivo(archivo: FileList) {
    this.archivoPolitica = archivo.item(0);
    this.nombreArchivo = this.archivoPolitica.name;""
    this.consultarULs();
  }

  subirArchivo() {
    this.archivoPolitica = null;
    let archivo = this.documento.getElementById("archivo");
    archivo.click()
  }

  consultarULs(){
    this._politicaService.contarUrls(this.archivoPolitica).subscribe(
      resultado => {
        let nota = '';
        this.translate.stream("politica.insertar.num_url",{num:resultado.mensaje}).subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota,'exito-snackbar')
        this.mensaje = nota;
        this.numero = +resultado.mensaje
        this.archivoEscogido = true;
      },
      error => {
        let nota = '';
        this.translate.stream("politica.insertar.error_archivo").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota,'fracaso-snackbar');
        this.mensaje = nota;
        this.archivoEscogido = false;
      }
    )
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 3000,
      verticalPosition: 'top'
    })
}

}
