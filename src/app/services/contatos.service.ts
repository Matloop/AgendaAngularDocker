import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contato } from '../models/contato.model'; 

@Injectable({
  providedIn: 'root'
})
export class ContatosService {
  private apiUrl = 'api/contatos'; // URL da API

  constructor(private http: HttpClient) { }

  // Método para buscar contatos
  getContatos(): Observable<Contato[]> {
    return this.http.get<Contato[]>(this.apiUrl);
  }

  // Método para adicionar contato
  addContato(contato: Contato): Observable<Contato> {
    return this.http.post<Contato>(this.apiUrl, contato);
  }

  // Método para atualizar contato
  updateContato(id: number, contato: Contato): Observable<Contato> {
    const url = `${this.apiUrl}/${id}`; // Corrigido as template strings
    return this.http.put<Contato>(url, contato);
  }

  // Método para deletar contato
  deleteContato(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`; // Corrigido as template strings
    return this.http.delete<void>(url);
  }
}