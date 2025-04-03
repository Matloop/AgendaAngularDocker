import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Compromisso } from '../models/compromisso.model';
import { Contato } from '../models/contato.model';
import { Local } from '../models/local.model';

@Injectable({
  providedIn: 'root'
})
export class PermissoesService {
  constructor(private authService: AuthService) {}

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // Verifica se o usuário é administrador
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Obtém o ID do usuário atual
  getCurrentUserId(): number {
    const userInfo = this.authService.getUserInfo();
    return userInfo ? Number(userInfo.id) : 0;
  }

  // PERMISSÕES PARA COMPROMISSOS
  canCreateCompromisso(): boolean {
    // Todos os usuários autenticados podem criar compromissos
    return this.isAuthenticated();
  }

  canEditCompromisso(compromisso: Compromisso): boolean {
    // Admins podem editar qualquer compromisso
    // Usuários comuns só podem editar seus próprios compromissos
    if (!this.isAuthenticated()) return false;
    if (this.isAdmin()) return true;
    
    // Verificar se o compromisso pertence ao usuário atual
    return compromisso.usuarioId === this.getCurrentUserId();
  }

  canDeleteCompromisso(compromisso: Compromisso): boolean {
    // Mesma lógica da edição
    // Admins podem deletar qualquer compromisso
    // Usuários comuns só podem deletar seus próprios compromissos
    if (!this.isAuthenticated()) return false;
    if (this.isAdmin()) return true;
    
    return compromisso.usuarioId === this.getCurrentUserId();
  }

  // PERMISSÕES PARA CONTATOS
  canCreateContato(): boolean {
    // Todos os usuários autenticados podem criar contatos
    return this.isAuthenticated();
  }

  canEditContato(contato: Contato): boolean {
    // Admins podem editar qualquer contato
    // Usuários comuns só podem editar seus próprios contatos
    if (!this.isAuthenticated()) return false;
    if (this.isAdmin()) return true;
    
    // Verificar se o contato pertence ao usuário atual
    // Presume-se que o model de contato tenha um campo usuarioId
    // Se não tiver, será necessário adicionar esse campo
    return contato.usuarioId === this.getCurrentUserId();
  }

  canDeleteContato(contato: Contato): boolean {
    // Mesma lógica da edição
    if (!this.isAuthenticated()) return false;
    if (this.isAdmin()) return true;
    
    return contato.usuarioId === this.getCurrentUserId();
  }

  // PERMISSÕES PARA LOCAIS
  canCreateLocal(): boolean {
    // Somente admins podem criar locais
    return this.isAuthenticated() && this.isAdmin();
  }

  canEditLocal(): boolean {
    // Somente admins podem editar locais
    return this.isAuthenticated() && this.isAdmin();
  }

  canDeleteLocal(): boolean {
    // Somente admins podem deletar locais
    return this.isAuthenticated() && this.isAdmin();
  }

  // PERMISSÕES PARA USUÁRIOS (administração)
  canManageUsers(): boolean {
    // Somente admins podem gerenciar usuários
    return this.isAuthenticated() && this.isAdmin();
  }
}