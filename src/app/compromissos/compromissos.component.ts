import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompromissosService } from '../services/compromissos.service';
import { ContatosService } from '../services/contatos.service';
import { LocaisService } from '../services/locais.service';
import { AuthService } from '../services/auth.service';
import { Compromisso } from '../models/compromisso.model';
import { Contato } from '../models/contato.model';
import { Local } from '../models/local.model';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogActions, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-compromissos',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatLabel,
    MatOptionModule,
  ],
  templateUrl: './compromissos.component.html',
  styleUrls: ['./compromissos.component.css']
})
export class CompromissosComponent implements OnInit {
  compromissos: Compromisso[] = [];
  contatos: Contato[] = [];
  locais: Local[] = [];
  dataSource = new MatTableDataSource(this.locais)
  mostrarFormulario: boolean = false;
  
  compromissoEditando: Compromisso = { 
    titulo: '', 
    descricao: '', 
    data: '', 
    hora: '', 
    contatoId: 0, 
    localId: 0, 
    usuarioId: 0 
  };
  
  compromissoAtualId: number | null = null;
  mostrarEdicaoForm: boolean = false;
  compromissoParaExcluir: number | null = null;
  isLoading: boolean = true;
  displayedColumns: string[] = ['titulo', 'data', 'hora', 'contato', 'local', 'acoes'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private compromissosService: CompromissosService,
    private contatosService: ContatosService,
    private locaisService: LocaisService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.carregarContatos();
    this.carregarLocais();
    this.carregarCompromissos();
    this.dataSource.paginator = this.paginator;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarCompromissos(): void {
    this.isLoading = true;
    const userId = this.authService.getCurrentUserId();
    
    if (this.authService.isAdmin()) {
      this.compromissosService.getCompromissos()
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (compromissos) => {
            this.compromissos = compromissos;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erro ao carregar compromissos:', err);
            this.isLoading = false;
            this.mostrarMensagem('Erro ao carregar compromissos. Tente novamente.');
          }
        });
    } else if (userId) {
      this.compromissosService.getCompromissosByUsuario(userId)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (compromissos) => {
            this.compromissos = compromissos;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erro ao carregar compromissos:', err);
            this.isLoading = false;
            this.mostrarMensagem('Erro ao carregar compromissos. Tente novamente.');
          }
        });
    } else {
      this.isLoading = false;
      this.compromissos = [];
    }
  }

  carregarContatos(): void {
    this.contatosService.getContatos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contatos) => this.contatos = contatos,
        error: (err) => {
          console.error('Erro ao carregar contatos:', err);
          this.mostrarMensagem('Erro ao carregar contatos. Tente novamente.');
        }
      });
  }

  carregarLocais(): void {
    this.locaisService.getLocais()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locais) => this.locais = locais,
        error: (err) => {
          console.error('Erro ao carregar locais:', err);
          this.mostrarMensagem('Erro ao carregar locais. Tente novamente.');
        }
      });
  }

  adicionarCompromisso(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.mostrarMensagem('Usuário não autenticado');
      return;
    }
  
    this.compromissoEditando.usuarioId = userId;
    this.isLoading = true;
    
    this.compromissosService.addCompromisso(this.compromissoEditando)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.carregarCompromissos();
          this.mostrarFormulario = false;
          this.resetarFormulario();
          this.mostrarMensagem('Compromisso adicionado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao adicionar compromisso:', err);
          this.mostrarMensagem('Erro ao adicionar compromisso. Tente novamente.');
        }
      });
  }

  confirmarExclusao(id: number): void {
    this.compromissoParaExcluir = id;
    this.dialog.open(this.confirmDialog);
  }

  deletarCompromisso(id: number | null): void {
    if (!id) return;
    
    const compromisso = this.compromissos.find(c => c.id === id);
    if (!compromisso || !this.podeDeletarCompromisso(compromisso)) {
      this.mostrarMensagem('Sem permissão para deletar este compromisso');
      return;
    }

    this.isLoading = true;
    this.compromissosService.deleteCompromisso(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.compromissos = this.compromissos.filter(c => c.id !== id);
          this.mostrarMensagem('Compromisso excluído com sucesso!');
          this.dialog.closeAll();
        },
        error: (err) => {
          console.error('Erro ao deletar compromisso:', err);
          this.mostrarMensagem('Erro ao excluir compromisso. Tente novamente.');
        }
      });
  }

  editarCompromisso(id: number): void {
    const compromissoSelecionado = this.compromissos.find(c => c.id === id);
    if (!compromissoSelecionado || !this.podeEditarCompromisso(compromissoSelecionado)) {
      this.mostrarMensagem('Sem permissão para editar este compromisso');
      return;
    }

    this.compromissoAtualId = id;
    this.compromissoEditando = { ...compromissoSelecionado };
    this.dialog.open(this.editDialog);
  }

  confirmarEdicao(): void {
    if (this.compromissoAtualId !== null) {
      const compromisso = this.compromissos.find(c => c.id === this.compromissoAtualId);
      if (!compromisso || !this.podeEditarCompromisso(compromisso)) {
        this.mostrarMensagem('Sem permissão para editar este compromisso');
        return;
      }

      this.isLoading = true;
      this.compromissosService.updateCompromisso(this.compromissoAtualId, this.compromissoEditando)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.carregarCompromissos();
            this.cancelarEdicao();
            this.mostrarMensagem('Compromisso atualizado com sucesso!');
            this.dialog.closeAll();
          },
          error: (err) => {
            console.error('Erro ao atualizar compromisso:', err);
            this.mostrarMensagem('Erro ao atualizar compromisso. Tente novamente.');
          }
        });
    }
  }

  cancelarEdicao(): void {
    this.resetarFormulario();
    this.compromissoAtualId = null;
    this.mostrarEdicaoForm = false;
  }

  resetarFormulario(): void {
    this.compromissoEditando = { 
      titulo: '', 
      descricao: '', 
      data: '', 
      hora: '', 
      contatoId: 0, 
      localId: 0, 
      usuarioId: 0 
    };
  }

  exibirFormulario(): void {
    this.resetarFormulario();
    this.mostrarFormulario = true;
  }

  getNomeContato(id: number): string {
    const contato = this.contatos.find(c => c.id === id);
    return contato ? contato.nome : 'Contato não encontrado';
  }

  getNomeLocal(id: number): string {
    const local = this.locais.find(l => l.id === id);
    return local ? local.nome : 'Local não encontrado';
  }

  podeEditarCompromisso(compromisso: Compromisso): boolean {
    const userId = this.authService.getCurrentUserId();
    return (compromisso.usuarioId === userId) || this.authService.isAdmin();
  }

  podeDeletarCompromisso(compromisso: Compromisso): boolean {
    const userId = this.authService.getCurrentUserId();
    return (compromisso.usuarioId === userId) || this.authService.isAdmin();
  }

  podeCriarCompromisso(): boolean {
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