export class PoliticaAnotarConsultar{
 constructor( 
      public id_politica: number,
      public id_usuario: number,
      public nombre : string,
      public usuario: string,
      public tipo_usuario: string,
      public fecha: string,
      public anotaciones: number,
      public escoger: Boolean
  ){}
}

export class Reportes{
  constructor(
      public formato: string,
      public politicas: PoliticaAnotarConsultar[],
  ){}
}

export class ReportesRespuesta{
  constructor(
      public archivo: File
  ){}
}