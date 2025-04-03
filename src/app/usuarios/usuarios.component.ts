// src/app/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../services/usuarios.service';
import { Usuario } from '../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario: boolean = false;
  usuarioEditando: Usuario = { nome: '', email: '', senha: '', nivelAcesso: 'usuario' };
  usuarioAtualId: number | null = null;
  mostrarEdicaoForm: boolean = false;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios = usuarios,
      error: (err) => console.error('Erro ao carregar usuários:', err)
    });
  }

  adicionarUsuario(): void {
    this.usuariosService.addUsuario(this.usuarioEditando).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.mostrarFormulario = false;
        this.resetarFormulario();
      },
      error: (err) => console.error('Erro ao adicionar usuário:', err)
    });
  }

  deletarUsuario(id: number): void {
    this.usuariosService.deleteUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(usuario => usuario.id !== id);
      },
      error: (err) => console.error('Erro ao deletar usuário:', err)
    });
  }

  editarUsuario(id: number): void {
    this.usuarioAtualId = id;
    const usuarioSelecionado = this.usuarios.find(u => u.id === id);

    if (usuarioSelecionado) {
      this.usuarioEditando = { ...usuarioSelecionado };
      this.mostrarEdicaoForm = true;
    }
  }

  confirmarEdicao(): void {
    if (this.usuarioAtualId !== null) {
      this.usuariosService.updateUsuario(this.usuarioAtualId, this.usuarioEditando)
        .subscribe({
          next: () => {
            this.carregarUsuarios();
            this.cancelarEdicao();
          },
          error: (err) => console.error('Erro ao atualizar usuário:', err)
        });
    }
  }

  cancelarEdicao(): void {
    this.resetarFormulario();
    this.usuarioAtualId = null;
    this.mostrarEdicaoForm = false;
  }

  resetarFormulario(): void {
    this.usuarioEditando = { nome: '', email: '', senha: '', nivelAcesso: 'usuario' };
  }

  exibirFormulario(): void {
    this.resetarFormulario();
    this.mostrarFormulario = true;
  }
}