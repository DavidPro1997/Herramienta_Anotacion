
export class PoliticaGuardar {
  constructor(
      public nombre : string,
      public url: string,
      public fecha: string,
      public texto: string
  ){

  }
}

export class RespuestaPoliticaVisualizar{
  constructor(
      public estado :string,
      public mensaje: string,
      public politica : PoliticaVisualizar
  ){}
}

export class RespuestaExtraccionTexto{
  constructor(
      public texto_politica :string,
      public estado :string,
      public url :string,
  ){}
}

export class PoliticaVisualizar{
  constructor(
      public nombre : string,
      public parrafos: ParrafoVisualizar[]
  ){
  }
}

export class ParrafoVisualizar {
  constructor(
      public id : number,
      public titulo: string,
      public texto_html: string 
  ){}

}