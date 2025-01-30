import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { Subscription } from 'rxjs';

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private socket$!: WebSocketSubject<any>;
  private socketSubscription!: Subscription; // Store the WebSocket subscription
  messages: ChatMessage[] = [];
  currentMessage = '';
  roomId!: string; // This is the selectedServer
  servers: any[] = []; // Use `any` instead of `Room` interface
  selectedServer: any = null; // Use `any` instead of `Room`
  users: any[] = []; // Use `any` instead of `User` interface
  selectedUser: any = null; // Use `any` instead of `string`

  // Modal state
  isAddServerModalOpen = false;
  newRoomName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService // Inject RoomService
  ) {
    // Extract room ID (selectedServer) from the URL
    this.route.params.subscribe((params) => {
      this.roomId = params['roomId'];
      this.selectedServer = this.servers.find((room) => room.name === this.roomId) || null;

      // Fetch old messages for the selected room
      this.fetchOldMessages(this.roomId);

      // Connect to WebSocket for real-time updates
      this.connectToWebSocket();
    });
  }

  ngOnInit() {
    // Fetch rooms for the logged-in user
    this.roomService.fetchRooms();

    // Subscribe to servers$ observable
    this.roomService.servers$.subscribe((servers) => {
      this.servers = servers;
    });

    // Subscribe to users$ observable
    this.roomService.users$.subscribe((users) => {
      this.users = users;
    });
  }

  connectToWebSocket() {
    // Close existing WebSocket connection if it exists
    if (this.socket$) {
      this.socket$.complete();
    }

    // Connect to WebSocket endpoint with roomId (selectedServer)
    this.socket$ = webSocket(`ws://localhost:8080/ws/${this.roomId}?username=${localStorage.getItem('username')}`);

    // Subscribe to incoming messages
    this.socketSubscription = this.socket$.subscribe({
      next: (message: any) => {
        let timestamp = new Date(message.timestamp);
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid timestamp, using current date:', message.timestamp);
          timestamp = new Date(); // Fallback to current date
        }
        this.messages.push({
          sender: message.sender,
          text: message.text,
          timestamp: timestamp,
        });
      },
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed'),
    });
  }

  fetchOldMessages(roomId: string) {
    this.roomService.getMessagesForRoom(roomId).subscribe({
      next: (messages: any[]) => {
        this.messages = messages.map((message) => {
          let timestamp = new Date(message.timestamp);
          if (isNaN(timestamp.getTime())) {
            console.warn('Invalid timestamp, using current date:', message.timestamp);
            timestamp = new Date(); // Fallback to current date
          }
          return {
            sender: message.sender.username,
            text: message.content,
            timestamp: timestamp,
          };
        });
      },
      error: (err) => {
        console.error('Failed to fetch old messages:', err);
      },
    });
  }

  selectServer(server: string) {
    // Navigate to the selected server (room)
    this.router.navigate(['/chat', server]);
  }

  selectUser(user: any) {
    this.selectedUser = user;
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      const messageToSend = {
        sender: localStorage.getItem('username'),
        text: this.currentMessage,
        roomName: this.roomId, // Include the room name
      };

      // Send the message to the server
      this.socket$.next(messageToSend);
      this.currentMessage = '';
    }
  }

  ngOnDestroy() {
    // Close WebSocket connection when component is destroyed
    if (this.socket$) {
      this.socket$.complete();
    }

    // Unsubscribe from the WebSocket subscription
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  // Modal methods
  openAddServerModal() {
    this.isAddServerModalOpen = true;
  }

  closeAddServerModal() {
    this.isAddServerModalOpen = false;
    this.newRoomName = '';
  }

  addOrJoinRoom() {
    if (this.newRoomName.trim()) {
      this.roomService.getRoomByName(this.newRoomName.trim()).subscribe({
        next: (room: any) => {
          if (room) {
            this.roomService.joinRoom(this.newRoomName.trim()).subscribe({
              next: () => {
                this.selectServer(this.newRoomName.trim());
                this.closeAddServerModal();
              },
              error: (err) => {
                console.error('Failed to join room:', err);
                alert('Error occurred while joining the room.');
              },
            });
          } else {
            this.roomService.createRoom(this.newRoomName.trim()).subscribe({
              next: (newRoom: any) => {
                this.roomService.joinRoom(this.newRoomName.trim()).subscribe({
                  next: () => {
                    this.roomService.addServer(newRoom);
                    this.closeAddServerModal();
                  },
                  error: (err) => {
                    console.error('Failed to join the newly created room:', err);
                    alert('Error occurred while joining the newly created room.');
                  },
                });
              },
              error: (err) => {
                console.error('Failed to create room:', err);
                alert('Error occurred while creating the room.');
              },
            });
          }
        },
        error: (err) => {
          console.error('Error while checking room existence:', err);
          alert('Error occurred while checking room existence.');
        },
      });
    }
  }
}