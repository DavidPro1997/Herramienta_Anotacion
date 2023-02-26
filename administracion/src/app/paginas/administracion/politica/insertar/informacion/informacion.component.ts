import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBarConfig, MatSnackBar } from "@angular/material";


@Component({
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.css']
})
export class InformacionComponent implements OnInit {

  tipoAyuda: boolean;
  ayudaUrls: boolean = false;
  ayudaTexto: boolean = false;
  constructor(public dialogRef: MatDialogRef<InformacionComponent>,
    @Inject(MAT_DIALOG_DATA) public tipo: boolean){
      this.tipoAyuda=tipo;
    }
  

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.tipoAyuda){
      this.ayudaTexto = false;
      this.ayudaUrls = true;
    }
    else{
      this.ayudaTexto = true;
      this.ayudaUrls = false;
    }
  }

}
