import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jinzo';
  private apiUrl = 'http://localhost:8080'; // Add the backend URL here

  constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

  register(user: { username: string, password: string }) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/register`, user, { headers, withCredentials: true, responseType: 'text' }); // Use the full URL
  }

  login(user: { username: string, password: string }) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/login`, user, { headers, withCredentials: true, responseType: 'text' }); // Use the full URL
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  setCurrentUsername(username: string): void {
    this.userService.setCurrentUsername(username);
  }
  
  decodeToken(token: string): string {
    try {
      const payload = token.split('.')[1]; // Extract payload part of the token
      const decodedPayload = atob(payload); // Decode the base64 payload
      return JSON.parse(decodedPayload); // Parse the JSON payload
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }
}