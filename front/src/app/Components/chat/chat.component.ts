import { Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
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
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private socket$!: WebSocketSubject<any>;
  private socketSubscription!: Subscription;
  messages: ChatMessage[] = [];
  currentMessage = '';
  roomId!: string;
  servers: any[] = [];
  selectedServer: any = null;
  users: any[] = [];
  selectedUser: any = null;

  // Modal state
  isAddServerModalOpen = false;
  newRoomName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService
  ) { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit() {
    // Fetch rooms for the logged-in user
    this.roomService.fetchRooms();

    // Subscribe to servers$ observable
    this.roomService.servers$.subscribe((servers) => {
      this.servers = servers;
      if (this.servers.length > 0) {
        this.selectedServer = this.servers[0];
        this.router.navigate(['/chat', this.selectedServer.name]); // Navigate to the default room
      }
    });

    // Subscribe to users$ observable
    this.roomService.users$.subscribe((users) => {
      this.users = users;
    });

    // Subscribe to route parameter changes
    this.route.params.subscribe((params) => {
      const newRoomId = params['roomId'];
      if (newRoomId !== this.roomId) {
        this.initializeRoom(newRoomId);
      }
    });
  }

  logout(){
    localStorage.clear();
    this.router.navigate(['/auth']);
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Failed to scroll to bottom:', err);
    }
  }

  private initializeRoom(roomId: string) {
    // Reset data for the new room
    this.roomId = roomId;
    this.selectedServer = this.servers.find((room) => room.name === roomId) || null;
    this.messages = [];
    this.users = [];

    // Fetch old messages for the new room
    this.fetchOldMessages(roomId);

    // Connect to WebSocket for real-time updates
    this.connectToWebSocket();

    // Fetch initial users for the new room
    this.roomService.getUsersForRoom(roomId);
  }

  private connectToWebSocket() {
    // Close existing WebSocket connection if it exists
    if (this.socket$) {
      this.socket$.complete();
    }

    // Connect to WebSocket endpoint with roomId and username
    this.socket$ = webSocket(`ws://localhost:8080/ws/${this.roomId}?username=${localStorage.getItem('username')}`);

    // Subscribe to incoming messages
    this.socketSubscription = this.socket$.subscribe({
      next: (message: any) => {
        if (message.event === 'USER_JOINED' || message.event === 'USER_LEFT') {
          // Handle user events
          this.roomService.getUsersForRoom(this.roomId); // Refresh user list
        } else {
          // Handle regular messages
          this.handleIncomingMessage(message);
        }
      },
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed'),
    });
  }

  private handleIncomingMessage(message: any) {
    const timestamp = new Date(message.timestamp);
    this.messages.push({
      sender: message.sender,
      text: message.text,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
    });
  }

  private fetchOldMessages(roomId: string) {
    this.roomService.getMessagesForRoom(roomId).subscribe({
      next: (messages: any[]) => {
        this.messages = messages.map((message) => {
          const timestamp = new Date(message.timestamp);
          return {
            sender: message.sender.username,
            text: message.content,
            timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
          };
        });
      },
      error: (err) => console.error('Failed to fetch old messages:', err),
    });
  }

  selectServer(server: string) {
    // Avoid redundant navigation
    if (this.roomId === server) return;

    // Close current WebSocket and reset data
    this.disconnectFromWebSocket();
    this.messages = [];
    this.users = [];

    // Navigate to the new room
    this.router.navigate(['/chat', server]);
  }

  private disconnectFromWebSocket() {
    if (this.socket$) {
      this.socket$.complete();
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  selectUser(user: any) {
    console.log(user);
    this.selectedUser = user;
  }

  sendMessage() {
    if (this.currentMessage.trim()) {
      const messageToSend = {
        sender: localStorage.getItem('username'),
        text: this.currentMessage,
        roomName: this.roomId,
      };

      // Send the message to the server
      this.socket$.next(messageToSend);
      this.currentMessage = '';
    }
  }

  ngOnDestroy() {
    // Close WebSocket connection when component is destroyed
    this.disconnectFromWebSocket();
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