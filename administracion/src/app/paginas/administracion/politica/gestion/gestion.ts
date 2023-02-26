
export class PoliticaGuardar {
  constructor(
      public nombre : string,
      public url: string,
      public fecha: string
  ){

  }
}

export class PoliticaConsultar{
 constructor(
      public id : number, 
      public nombre : string,
      public url: string,
      public fecha: string,
      public asignada?: boolean
  ){

  }
}

export class PoliticaAnotarConsultar{
  constructor(
      public politica_id : number,
      public politica_nombre: string,
      public progreso: number
  ){}
}

export class RespuestaPoliticaVisualizar{
  constructor(
      public estado :string,
      public mensaje: string,
      public politica : PoliticaVisualizar
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