import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-login-and-register',
  templateUrl: './login-and-register.component.html',
  styleUrls: ['./login-and-register.component.css']
})
export class LoginAndRegisterComponent {
  showLoginForm: boolean = true;

  loginUsername: string = '';
  loginPassword: string = '';
  registerUsername: string = '';
  registerPassword: string = '';

  loginError: string = '';
  registerError: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  toggleForm(event: Event): void {
    event.preventDefault();
    this.showLoginForm = !this.showLoginForm;
    this.loginError = '';
    this.registerError = '';
    this.clearFields();
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();

    this.authService.login({ username: this.loginUsername, password: this.loginPassword }).subscribe({
      next: (token: string) => {
        console.log('Login successful', token);
        this.authService.setToken(token);
        this.router.navigate(['/general']);
        this.clearFields();
      },
      error: (error) => {
        console.error('Login failed', error);
        this.loginError = 'Invalid username or password';
      }
    });
  }

  onRegisterSubmit(event: Event): void {
    event.preventDefault();

    this.authService.register({ username: this.registerUsername, password: this.registerPassword }).subscribe({
      next: (response: string) => {
        console.log('Registration successful', response);
        this.toggleForm(event);
        this.clearFields();
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.registerError = 'Registration failed. Please try again.';
      }
    });
  }

  clearFields() {
    this.loginUsername = '';
    this.loginPassword = '';
    this.registerUsername = '';
    this.registerPassword = '';
  }
}