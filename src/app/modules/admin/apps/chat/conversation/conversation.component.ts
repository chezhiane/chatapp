import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { Chat } from 'app/modules/admin/apps/chat/chat.types';
import { ContactInfoComponent } from 'app/modules/admin/apps/chat/contact-info/contact-info.component';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
    selector       : 'chat-conversation',
    templateUrl    : './conversation.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, MatSidenavModule, MatButtonModule, RouterLink, MatIconModule, MatMenuModule, NgFor, NgClass, NgTemplateOutlet, MatFormFieldModule, MatInputModule, TextFieldModule, DatePipe,FormsModule],
})
export class ConversationComponent implements OnInit, OnDestroy
{   
    message: string = '';
    webSocket: any;
    messages = [];
    //dialog: string = '';
    @ViewChild('messageInput') messageInput: ElementRef;
    chat: Chat;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userId: string;
    TenantId: string;
    projectId: string;
    showSignOffForm: boolean = false; 
    //
    emailAddress: string = '';
    phoneNumber: string = '';
    appointmentDate: Date | null = null;
    chatmessageBox: boolean = true; 
    //
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _chatService: ChatService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _ngZone: NgZone,
        private _activatedRoute: ActivatedRoute // Inject ActivatedRoute here
    )
    {
      this.webSocket = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Decorated methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resize on 'input' and 'ngModelChange' events
     *
     * @private
    
    @HostListener('input')
    @HostListener('ngModelChange')
    private _resizeMessageInput(): void
    {
        // This doesn't need to trigger Angular's change detection by itself
        this._ngZone.runOutsideAngular(() =>
        {
            setTimeout(() =>
            {
                // Set the height to 'auto' so we can correctly read the scrollHeight
                this.messageInput.nativeElement.style.height = 'auto';

                // Detect the changes so the height is applied
                this._changeDetectorRef.detectChanges();

                // Get the scrollHeight and subtract the vertical padding
                this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;

                // Detect the changes one more time to apply the final height
                this._changeDetectorRef.detectChanges();

                console.log('mes',this.messageInput)
            });
        });
    }
     */
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        console.log('in init')
        // Chat
        this._activatedRoute.params.subscribe(params => {
          this.userId = params['id'];
          console.log('User ID from route:', this.userId);
          //this has to be corrected eventually 
          localStorage.setItem('sessionId', this.userId);
          this.TenantId = params['TenantId'];
          console.log('User ID from route:', this.TenantId);
          localStorage.setItem('tenantId', this.TenantId);
          this.projectId = params['projectId'];
          console.log('User ID from route:', this.projectId);
          localStorage.setItem('projectId', this.projectId);
          localStorage.removeItem('provideNonAvailable');
          localStorage.removeItem('LiveAgentConversationClose')
          
        });

        this._chatService.chat$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((chat: Chat) =>
        {
            this.chat = chat;
            console.log('comp chat',this.chat)
            console.log('chat.messages', chat.messages);
            this._changeDetectorRef.markForCheck();
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Set the drawerMode if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                }
                else
                {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

      playPingSound(): void {
        let audio = document.getElementById('pingSound') as HTMLAudioElement;
        if (audio) {
          audio.play();
        }
      }

      sendMessage() {
        console.log('send message was clicked', this.message);
        const liveAgentID = localStorage.getItem('liveAgentID');
        if (localStorage.getItem('passedToLiveagent') !== 'true') {
            if (this.message.trim()) {
                const userMessage = {
                    enaikoChatId: this.userId, // Use the userId obtained from the route
                    isMine: true,
                    value: this.message,
                    msgType: 'C',
                    src: 'web'
                };
    
                console.log('userMessage', userMessage);
                this.chat.messages.push(userMessage);

                // Temporary "Thinking..." message Remove this and do it in websocket
                const thinkingMessage = {
                  enaikoChatId: this.userId,
                  //isMine: false,
                  value: 'Thinking...',
                 // msgType: 'C',
                  src: 'web'
              };
              this.chat.messages.push(thinkingMessage);
              this._changeDetectorRef.markForCheck();
            
                // Send the message to the server
                this._chatService.sendMessageToServer(this.message, this.userId).subscribe(response => {
                    // Remove "Thinking..." message
                    const index = this.chat.messages.findIndex(msg => msg.value === 'Thinking...');
                    if (index !== -1) {
                        this.chat.messages.splice(index, 1);
                    }
                    // Handle server response here
                    console.log('came here', response);
                    
                    response.botReply = response.message;
                    const botResponse = {
                        enaikoChatId: this.userId,
                        isMine: false,
                        value: response.botReply, // Assuming response contains botReply
                        category: response.category,
                        msgType: 'C',
                        src: 'web'
                    };
                    
                    console.log('botResponse', botResponse);
                    console.log('message', userMessage.value);
                    
                    // If the category is 'D' or 'E', store the flag in local storage
                    if (['B','C', 'E','F'].includes(response.category)) {
                        localStorage.setItem('passedToLiveagent', 'true');
                        localStorage.setItem('QuestionPassedOverToAgent', userMessage.value);
                        this.sendMessage()
                        //this.showSignOffForm = true; 
                        // Store the current time as the pass to live agent time
                        const currentTime = new Date().getTime();
                        localStorage.setItem('passToLiveAgentTime', currentTime.toString());
                        console.log('joy')
                        // Check after 3 minutes if liveAgentID is populated
                        setTimeout(() => {
                            // Assuming liveAgentID is stored in localStorage (adjust according to your application's logic)
                            const liveAgentID = localStorage.getItem('liveAgentID');
                            const LiveAgentConversationClose = localStorage.getItem('LiveAgentConversationClose');
                            //LiveAgentConversationClose
                            if ((!liveAgentID) && (!LiveAgentConversationClose)) {
                                // Set provideNonAvailable flag if liveAgentID is not populated
                                this.chatmessageBox = false;
                                localStorage.setItem('provideNonAvailable', 'true');
                                localStorage.removeItem('passedToLiveagent');
                                localStorage.removeItem('QuestionPassedOverToAgent');
                                localStorage.removeItem('passToLiveAgentTime')
                                 // Temporary "Thinking..." message Remove this and do it in websocket
                                const NonAvailabilityMessage = {
                                    enaikoChatId: this.userId,
                                    //isMine: false,
                                    value: 'Sorry we are not available to take your chat. Please fill these details and we will get back',
                                // msgType: 'C',
                                    src: 'web'
                                };
                                this.chat.messages.push(NonAvailabilityMessage);
                                // You may need to trigger any UI update or notification logic here
                                // show a message to the user indicating that live agent service is currently not available
                                console.log('Live agent service is currently not available.');
                                this.showSignOffForm = true; // Set showSignOffForm to true
                                this._changeDetectorRef.detectChanges(); 
                            }
                        }, 60000); // 180,000 milliseconds = 3 minutes

                    }
                    this._changeDetectorRef.markForCheck();
                    this.chat.messages.push(botResponse);
                    this.playPingSound()
                    
                }, error => {
                    console.error('Error sending message', error);
                });
    
                // Clear the message input
                this.message = '';
                this._changeDetectorRef.markForCheck();
            }
        } else {
            // Directly push the message to the screen without sending to the server
            // Check if WebSocket is already defined and connection is open
            if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
                console.log('WebSocket is not open or not defined.');
                console.log('bef connect sessionID:', this.userId);
                console.log('bef connect tenantID:', this.TenantId);
                // Logic to handle this scenario, such as attempting to connect
               //this.webSocket = new WebSocket(`wss://sikr304jt7.execute-api.us-east-1.amazonaws.com/dev/?TenantId=${this.TenantId}&sessionId=${this.userId}&agentId=27bd4956&srcId=EnaikoUser`);
                this.webSocket = new WebSocket(`wss://x62d7erdu4.execute-api.us-east-1.amazonaws.com/dev/?TenantId=${this.TenantId}&sessionId=${this.userId}&agentId=27bd4956&srcId=EnaikoUser`);
               
               console.log('this.webSocket:',this.webSocket )
                console.log('1',this.message)
                this.webSocket.onopen = () => {
                    console.log('Connection opened');
                    const currentTime = new Date().toISOString(); 

                    //make a method out if this start
                    
                    this.sendAlert()
                    
                }
                this.webSocket.onmessage = (event) => {
                    console.log('Message from server ', event.data);
                    const message = JSON.parse(event.data);
                    if (message.type === 'ack') {
                        // Store the agentId in localStorage
                        localStorage.setItem('liveAgentID', message.agentId);
                        console.log('Stored liveAgentID:', message.agentId);
                    }else if (message.type === 'sar') {
                        console.log('message.message',message.message)
                        const AgentResponse = {
                           // enaikoChatId: this.userId,
                            isMine: false,
                            value: message.message, // Assuming response contains botReply
                           // category: response.category,
                            msgType: 'A',
                            src: 'web'
                        };
                        this.chat.messages.push(AgentResponse);
                        if (message.message === 'Conversation is closed'){
                            // The specific message is received, proceed to delete localStorage items
                            localStorage.removeItem('liveAgentID');
                            localStorage.removeItem('passedToLiveagent');
                            localStorage.removeItem('QuestionPassedOverToAgent');
                            localStorage.removeItem('provideNonAvailable');
                            localStorage.removeItem('passToLiveAgentTime')
                            // Additional logic to handle the conversation closure can be added here
                            console.log('Conversation is closed. Local storage items cleared.');
            
                            localStorage.setItem('LiveAgentConversationClose', 'true');
                            // Disconnect from WebSocket
                            this.disconnect();

                        }
                        //push to database
                        //push it this._chatService.sendMessageToServer(this.message, this.userId).subscribe(response => {})
                         //push to database
                        
                        this._chatService.sendAgentRespMessageToServer(message.message, message.clientsession, false).subscribe(response => {
                        console.log('res 10',response)
                        })
                        this.playPingSound()
                        this._changeDetectorRef.markForCheck();
                        
                    }
                    else {
                        console.log('WebSocket error message',event);
                    }
                  
                  }    
    
                this.webSocket.onclose = () => {
                    console.log('WebSocket connection closed1',);
                    const currentTime = new Date().toISOString(); // Gets the current time in ISO string format
                    console.log(`WebSocket connection closed at ${currentTime}`);
                  }
    
                this.webSocket.open = () => {
                      console.log('inside a open connection 1 ')
                
                } 

            }else{

                if (liveAgentID) {
                    console.log('liveAgentID is populated:', liveAgentID);
                    console.log('0',this.message)
                    const userMessage = {
                    enaikoChatId: this.userId,
                    isMine: true,
                    value: this.message,
                    msgType: 'C',
                    src: 'web'
                    };
        
                    console.log('Adding message directly to chat:', userMessage);
                    this.chat.messages.push(userMessage);
                    this._changeDetectorRef.markForCheck();
                    console.log('3',this.message)
                     //push to database
                    this._chatService.sendAgentMessageToServer(this.message, this.userId, true).subscribe(response => {
                        console.log('res 5',response)
                    })
                    const messagePayload = JSON.stringify({
                        action: "sendMessage",
                        message: this.message,
                        agentId:liveAgentID,
                        clientsession:this.userId,
                        type:'sca',
                        TenantId:this.TenantId
                    });
                    this.webSocket.send(messagePayload);
                    console.log("Message sent:", messagePayload);
                    this.message = ''
                    
                } else {
                    this.sendAlert()
                   
                }
                

            }
        };
        }
    
    private disconnect(): void {
            if (this.webSocket) {
              this.webSocket.close();
              console.log('Disconnected from WebSocket.');
            }
      }

    sendAlert(): void
    {
        console.log('liveAgentID is not populated.');
        // Logic when liveAgentID does not exist
        // For example, request assignment of a live agent or handle as an automated chat
        console.log('2',this.message)
        console.log('3',this.TenantId)
        //var sessionID = localStorage.getItem('sessionID');
        const messagePayload = JSON.stringify({
            action: "sendAlert",
            message: 'Transfer to Live agent',
            clientsession:this.userId,
            tenant_id:this.TenantId,
            projectId:this.projectId,
            type:'bdc',
            lastMessage:localStorage.getItem('QuestionPassedOverToAgent'),
            summary:'summary of conv1'
        });
        this.webSocket.send(messagePayload);
        console.log("Message sent:", messagePayload);
        this.message = ''
    }
    
    submitForm(): void
    {
        console.log('this.emailAddress',this.emailAddress)
        console.log('this.phoneNumber',this.phoneNumber)
        console.log('this.appointmentDate',this.appointmentDate)
        this._chatService.SubmitChatContactServ(this.emailAddress, this.phoneNumber, '123').subscribe(response => {
            console.log('res insode sudmitform',response)
        })
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the contact info
     */
    openContactInfo(): void
    {
        // Open the drawer
        this.drawerOpened = true;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Reset the chat
     */
    resetChat(): void
    {
        this._chatService.resetChat();

        // Close the contact info in case it's opened
        this.drawerOpened = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle mute notifications
     */
    toggleMuteNotifications(): void
    {
        // Toggle the muted
        this.chat.muted = !this.chat.muted;
        console.log('in toggleMuteNotification')
        // Update the chat on the server
        //this._chatService.updateChat(this.chat.id, this.chat).subscribe();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
