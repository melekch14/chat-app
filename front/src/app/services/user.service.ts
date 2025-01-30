import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUsernameSubject = new BehaviorSubject<string | null>(null);
  public currentUsername$ = this.currentUsernameSubject.asObservable();

  constructor() {}

  // Set the current username
  setCurrentUsername(username: string | null): void {
    this.currentUsernameSubject.next(username);
  }

  // Get the current username
  getCurrentUsername(): string | null {
    return this.currentUsernameSubject.value;
  }

  // Clear the current username (e.g., on logout)
  clearCurrentUsername(): void {
    this.currentUsernameSubject.next(null);
  }
}