import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local } from '../models/local.model';

@Injectable({
  providedIn: 'root'
})
export class LocaisService {
  private apiUrl = 'api/locais';

  constructor(private http: HttpClient) { }

  getLocais(): Observable<Local[]> {
    return this.http.get<Local[]>(this.apiUrl);
  }

  getLocal(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.apiUrl}/${id}`);
  }

  addLocal(local: Local): Observable<Local> {
    return this.http.post<Local>(this.apiUrl, local);
  }

  updateLocal(id: number, local: Local): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/${id}`, local);
  }

  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}