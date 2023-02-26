import { Component, OnInit, Inject } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ColorService } from './paleta-colores.service'
import { Color } from './color'

@Component({
  selector: 'app-paleta-colores',
  templateUrl: './paleta-colores.component.html',
  styleUrls: ['./paleta-colores.component.css']
})
export class PaletaColoresComponent {

  color_primario: string;
  id: number;
  @Output() event = new EventEmitter();

  formulario: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialogRef<PaletaColoresComponent>,
    private readonly colorService: ColorService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.color_primario = data.color_primario;
    this.id = null;
  }

  public show = true;

  public defaultColors: Color[] = [];

  /**
   * Change color from default colors
   * @param {string} color
   */
  public changeColor(color: string): void {
    this.color_primario = color;
    this.id = this.defaultColors.find(x => x.codigo == color).id;
    this.formulario = this.fb.group({
      id: [this.id],
      color_primario: [this.color_primario]
    })
    this.event.emit(this.color_primario);
  }

  guardarColor() {
    this.dialog.close(this.formulario.value)
  }

  estiloAnotacion(colorAux): Object {
    return {
      'color': colorAux,
      'font-weight': 'bold'
    }
  }

  consultarColoresDisponibles() {
    return this.colorService.ObtenerColoresDisponibles().subscribe(
      result => { this.defaultColors = result }
    )
  }


  ngOnInit() {
    this.formulario = this.fb.group({
      id: [this.id],
      color_primario: [this.color_primario]
    })
    this.consultarColoresDisponibles();
  }

}
