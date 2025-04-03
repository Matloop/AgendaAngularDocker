import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContatosService } from '../services/contatos.service';
import { AuthService } from '../services/auth.service';
import { Contato } from '../models/contato.model';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogActions, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-contatos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    // Angular Material Components
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatLabel,
    MatPaginatorModule
  ],
  templateUrl: './contatos.component.html',
  styleUrls: ['./contatos.component.css']
})
export class ContatosComponent implements OnInit {
  contatos: Contato[] = [];
  mostrarFormulario: boolean = false;
  
  contatoEditando: Contato = { 
    nome: '', 
    telefone: '', 
    email: '', 
    usuarioId: 0 
  };
  
  contatoAtualId: number | null = null;
  mostrarEdicaoForm: boolean = false;
  contatoParaExcluir: number | null = null;
  isLoading: boolean = true;
  displayedColumns: string[] = ['nome', 'telefone', 'email', 'acoes'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private contatosService: ContatosService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.carregarContatos();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarContatos(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUserId();
    
    if (this.authService.isAdmin()) {
      this.contatosService.getContatos()
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (contatos) => {
            this.contatos = contatos;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erro ao carregar contatos:', err);
            this.isLoading = false;
            this.mostrarMensagem('Erro ao carregar contatos. Tente novamente.');
          }
        });
    } else if (userId) {
      this.contatosService.getContatos()
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (contatos: Contato[]) => {
            this.contatos = contatos;
            this.isLoading = false;
          },
          error: (err: any) => {
            console.error('Erro ao carregar contatos:', err);
            this.isLoading = false;
            this.mostrarMensagem('Erro ao carregar contatos. Tente novamente.');
          }
        });
    } else {
      this.isLoading = false;
      this.contatos = [];
    }
  }

  adicionarContato(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.mostrarMensagem('Usuário não autenticado');
      return;
    }
  
    this.contatoEditando.usuarioId = userId;
    this.isLoading = true;
    
    this.contatosService.addContato(this.contatoEditando)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.carregarContatos();
          this.mostrarFormulario = false;
          this.resetarFormulario();
          this.mostrarMensagem('Contato adicionado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao adicionar contato:', err);
          this.mostrarMensagem('Erro ao adicionar contato. Tente novamente.');
        }
      });
  }

  confirmarExclusao(id: number): void {
    this.contatoParaExcluir = id;
    this.dialog.open(this.confirmDialog);
  }

  deletarContato(id: number | null): void {
    if (!id) return;
    
    const contato = this.contatos.find(c => c.id === id);
    if (!contato || !this.podeDeletarContato(contato)) {
      this.mostrarMensagem('Sem permissão para deletar este contato');
      return;
    }

    this.isLoading = true;
    this.contatosService.deleteContato(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.contatos = this.contatos.filter(c => c.id !== id);
          this.mostrarMensagem('Contato excluído com sucesso!');
          this.dialog.closeAll();
        },
        error: (err) => {
          console.error('Erro ao deletar contato:', err);
          this.mostrarMensagem('Erro ao excluir contato. Tente novamente.');
        }
      });
  }

  editarContato(id: number): void {
    const contatoSelecionado = this.contatos.find(c => c.id === id);
    if (!contatoSelecionado || !this.podeEditarContato(contatoSelecionado)) {
      this.mostrarMensagem('Sem permissão para editar este contato');
      return;
    }

    this.contatoAtualId = id;
    this.contatoEditando = { ...contatoSelecionado };
    this.dialog.open(this.editDialog);
  }

  confirmarEdicao(): void {
    if (this.contatoAtualId !== null) {
      const contato = this.contatos.find(c => c.id === this.contatoAtualId);
      if (!contato || !this.podeEditarContato(contato)) {
        this.mostrarMensagem('Sem permissão para editar este contato');
        return;
      }

      this.isLoading = true;
      this.contatosService.updateContato(this.contatoAtualId, this.contatoEditando)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.carregarContatos();
            this.cancelarEdicao();
            this.mostrarMensagem('Contato atualizado com sucesso!');
            this.dialog.closeAll();
          },
          error: (err) => {
            console.error('Erro ao atualizar contato:', err);
            this.mostrarMensagem('Erro ao atualizar contato. Tente novamente.');
          }
        });
    }
  }

  cancelarEdicao(): void {
    this.resetarFormulario();
    this.contatoAtualId = null;
    this.mostrarEdicaoForm = false;
  }

  resetarFormulario(): void {
    this.contatoEditando = { 
      nome: '', 
      telefone: '', 
      email: '', 
      usuarioId: 0 
    };
  }

  exibirFormulario(): void {
    this.resetarFormulario();
    this.mostrarFormulario = true;
  }

  podeEditarContato(contato: Contato): boolean {
    const userId = this.authService.getCurrentUserId();
    return (contato.usuarioId === userId) || this.authService.isAdmin();
  }

  podeDeletarContato(contato: Contato): boolean {
    const userId = this.authService.getCurrentUserId();
    return (contato.usuarioId === userId) || this.authService.isAdmin();
  }

  podeCriarContato(): boolean {
    return this.authService.isAuthenticated();
  }
  
  mostrarMensagem(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}