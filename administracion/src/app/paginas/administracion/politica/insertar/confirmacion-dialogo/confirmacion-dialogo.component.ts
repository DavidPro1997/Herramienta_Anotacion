import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-confirmacion-dialogo',
  templateUrl: './confirmacion-dialogo.component.html',
  styleUrls: ['./confirmacion-dialogo.component.css']
})
export class ConfirmacionDialogoComponent implements OnInit {

  texto: boolean=false;
  nota: string = '';  
  constructor(public dialogo: MatDialogRef<ConfirmacionDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
    ) {}

  ngOnInit() {
    if(this.data.mensaje == 0){
        this.translate.stream("politica.insertar.confirmacion.1").subscribe((res: string)=>{
        this.nota = res;
      });
    }
    if(this.data.mensaje == 1){
      this.translate.stream("politica.insertar.confirmacion.2").subscribe((res: string)=>{
      this.nota = res;
    });
    }
    if(this.data.mensaje == 2){
      this.translate.stream("politica.insertar.confirmacion.3").subscribe((res: string)=>{
      this.nota = res;
    });
    }
  }

  cerrarDialogo(): void {
    this.dialogo.close(false);
  }

  confirmado(): void {
    this.dialogo.close(true);
  }

}
