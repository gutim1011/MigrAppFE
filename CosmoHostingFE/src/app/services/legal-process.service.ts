import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LegalProcessService {
  private apiUrl = 'http://localhost:5199/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getUserProcesses(userId: number): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/legalProcess/user/${userId}`, { headers });
  }

  getProcessDetails(processId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/legalProcess/${processId}`, { headers });
  }

  uploadDocument(procedureId: number, documentId: number, formData: FormData): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.post<any>(
    `${this.apiUrl}/procedures/${procedureId}/documents/${documentId}/upload`,
    formData,
    { headers }
  );
}

}
