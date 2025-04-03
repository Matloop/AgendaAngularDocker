import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocaisService } from '../services/locais.service';
import { Local } from '../models/local.model';
import { AuthService } from '../services/auth.service';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogActions, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';


import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-locais',
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
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogClose,
    MatLabel,
    MatPaginatorModule
  ],
  templateUrl: './locais.component.html',
  styleUrls: ['./locais.component.css']
})
export class LocaisComponent implements OnInit {
  locais: Local[] = [];
  dataSource = new MatTableDataSource(this.locais)
  mostrarFormulario: boolean = false;
  
  localEditando: Local = {
    nome: '',
    endereco: ''
  };
  
  localAtualId: number | null = null;
  mostrarEdicaoForm: boolean = false;
  localParaExcluir: number | null = null;
  isLoading: boolean = true;
  displayedColumns: string[] = ['nome', 'endereco', 'acoes'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private locaisService: LocaisService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.carregarLocais();
    this.dataSource.paginator = this.paginator;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  carregarLocais(): void {
    this.isLoading = true;
    
    this.locaisService.getLocais()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (locais) => {
          this.locais = locais;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar locais:', err);
          this.isLoading = false;
          this.mostrarMensagem('Erro ao carregar locais. Tente novamente.');
        }
      });
  }

  adicionarLocal(): void {
    this.isLoading = true;
    
    this.locaisService.addLocal(this.localEditando)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.carregarLocais();
          this.mostrarFormulario = false;
          this.resetarFormulario();
          this.mostrarMensagem('Local adicionado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao adicionar local:', err);
          this.mostrarMensagem('Erro ao adicionar local. Tente novamente.');
        }
      });
  }

  confirmarExclusao(id: number): void {
    this.localParaExcluir = id;
    this.dialog.open(this.confirmDialog);
  }

  deletarLocal(id: number | null): void {
    if (!id) return;
    
    this.isLoading = true;
    this.locaisService.deleteLocal(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.locais = this.locais.filter(l => l.id !== id);
          this.mostrarMensagem('Local excluído com sucesso!');
          this.dialog.closeAll();
        },
        error: (err) => {
          console.error('Erro ao deletar local:', err);
          this.mostrarMensagem('Erro ao excluir local. Tente novamente.');
        }
      });
  }

  editarLocal(id: number): void {
    const localSelecionado = this.locais.find(l => l.id === id);
    if (!localSelecionado) {
      this.mostrarMensagem('Local não encontrado');
      return;
    }

    this.localAtualId = id;
    this.localEditando = { ...localSelecionado };
    this.dialog.open(this.editDialog);
  }

  confirmarEdicao(): void {
    if (this.localAtualId !== null) {
      this.isLoading = true;
      this.locaisService.updateLocal(this.localAtualId, this.localEditando)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.carregarLocais();
            this.cancelarEdicao();
            this.mostrarMensagem('Local atualizado com sucesso!');
            this.dialog.closeAll();
          },
          error: (err) => {
            console.error('Erro ao atualizar local:', err);
            this.mostrarMensagem('Erro ao atualizar local. Tente novamente.');
          }
        });
    }
  }

  cancelarEdicao(): void {
    this.resetarFormulario();
    this.localAtualId = null;
    this.mostrarEdicaoForm = false;
  }

  resetarFormulario(): void {
    this.localEditando = {
      nome: '',
      endereco: ''
    };
  }

  exibirFormulario(): void {
    this.resetarFormulario();
    this.mostrarFormulario = true;
  }

  podeCriarLocal(): boolean {
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