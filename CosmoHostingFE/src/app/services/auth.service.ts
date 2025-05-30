import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MfaResponse } from '../models/mfa-response.model';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5199/api';
  private token = "authToken";

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }
  
  login(data: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }
  
  verifyMfaCode(data: { email: string, code: string, rememberMe: boolean }): Observable<MfaResponse> {
    return this.http.post<MfaResponse>(`${this.apiUrl}/auth/verify-mfa`, data);
  }

  getHelpContent(): Observable<any> {
  const lang = localStorage.getItem('language') || 'es'; // Valor por defecto: 'es'
  return this.http.get(`${this.apiUrl}/userHelp/?lang=${lang}`);
}


  getUserInfo(userId: number) {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization',`Bearer ${token}`);
  return this.http.get<any>(`${this.apiUrl}/user/${userId}/information`, { headers });
}

  updateUser(userId: number, data: any) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/user/${userId}/update`, data, { headers });
  }

  getUserProfile(userId: number) {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/profile`, { headers });
  }

  get getAccessToken(): string | null {
    return localStorage.getItem(this.token) || '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.token)
  }
  
  get currentLoggedUser() : string | null{
    const user = localStorage.getItem('userId') || '{}';
    return user;
  }

  logout() {
    localStorage.removeItem(this.token);
    localStorage.removeItem('user');
  }
}
