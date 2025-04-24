import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5199/api'; // URL base de la API

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials);
  }

  generateOtp(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/otp/generate`, credentials);
  }

  validateOtp(credentials: any): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/otp/validate`, credentials);
  }

  getHelpContent(): Observable<any> {
    return this.http.get(`${this.apiUrl}/userHelp`);
  }
}
