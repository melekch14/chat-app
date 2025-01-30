import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Room {
  id?: number; // Match the backend's `Long` type
  name: string;
  roomDescription?: string; // Optional field
  users?: string[]; // Match the backend's `List<User>` field
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/chat/rooms'; // Replace with your backend URL
  private apiUrll = 'http://localhost:8080/chat/messages'; // Replace with your backend URL

  // BehaviorSubject to manage the list of rooms
  private serversSubject = new BehaviorSubject<Room[]>([]);
  servers$ = this.serversSubject.asObservable();
  private usersSubject = new BehaviorSubject<string[]>([]);
  users$ = this.usersSubject.asObservable();

  getUsersForRoom(roomId: string): void {
    this.http
      .get<string[]>(`${this.apiUrl}/rooms/${roomId}/users`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (users) => {
          this.usersSubject.next(users);
        },
        error: (err) => {
          console.error('Failed to fetch users:', err);
          alert('Error occurred while fetching users.');
        },
      });
  }

  getMessagesForRoom(roomId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrll}/roommsg/${roomId}`, {
      headers: this.getHeaders(),
    });
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Fetch all rooms for the logged-in user
  fetchRooms(): void {
    const userName = localStorage.getItem('username'); // Get the logged-in user
    this.http
      .get<Room[]>(`${this.apiUrl}/usersRooms/${userName}`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (rooms) => {
          this.serversSubject.next(rooms); // Update the BehaviorSubject
        },
        error: (err) => {
          console.error('Failed to fetch rooms:', err);
          alert('Error occurred while fetching rooms.');
        },
      });
  }

  // Create a new room
  createRoom(roomName: string): Observable<Room> {
    const room: Room = {
      name: roomName, // Only the name is required for creation
      roomDescription: roomName, // Optional: Add a description if needed
    };
    return this.http.post<Room>(`${this.apiUrl}/create`, room, {
      headers: this.getHeaders(),
    });
  }

  // Join a room
  joinRoom(roomId: string): Observable<void> {
    const userName = localStorage.getItem('username'); // Get the logged-in user
    return this.http.post<void>(
      `${this.apiUrl}/addUser`,
      { roomId, userName },
      { headers: this.getHeaders() }
    );
  }

  // Get a room by name
  getRoomByName(roomName: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/getRoomByName/${roomName}`, {
      headers: this.getHeaders(),
    });
  }

  // Add a server to the list locally
  addServer(server: Room): void {
    const currentServers = this.serversSubject.value;
    this.serversSubject.next([...currentServers, server]);
  }

  // Get headers with authorization token
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Get the user's token
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }
}