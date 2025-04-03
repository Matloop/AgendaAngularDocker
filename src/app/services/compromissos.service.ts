import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Compromisso } from '../models/compromisso.model';

@Injectable({
  providedIn: 'root'
})
export class CompromissosService {
  private apiUrl = 'api/compromissos';

  constructor(private http: HttpClient) { }

  getCompromissos(): Observable<Compromisso[]> {
    return this.http.get<Compromisso[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCompromissosByUsuario(usuarioId: number): Observable<Compromisso[]> {
    const params = new HttpParams().set('usuarioId', usuarioId.toString());
    return this.http.get<Compromisso[]>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getCompromisso(id: number): Observable<Compromisso> {
    return this.http.get<Compromisso>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addCompromisso(compromisso: Compromisso): Observable<Compromisso> {
    const body = this.formatarData(compromisso);
    return this.http.post<Compromisso>(this.apiUrl, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateCompromisso(id: number, compromisso: Compromisso): Observable<Compromisso> {
    const body = this.formatarData(compromisso);
    return this.http.put<Compromisso>(`${this.apiUrl}/${id}`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteCompromisso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private formatarData(compromisso: Compromisso): any {
    return {
      ...compromisso,
      data: new Date(compromisso.data).toISOString()
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço:', error);
    return throwError(() => new Error('Ocorreu um erro. Tente novamente mais tarde.'));
  }
}