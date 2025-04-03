export class Contato {
  id?: number;
  nome: string;
  telefone: string;
  email: string;
  usuarioId: number; // nova propriedade

  constructor(nome: string = '', telefone: string = '', email: string = '', usuarioId: number = 0) {
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.usuarioId = usuarioId;
  }
}
