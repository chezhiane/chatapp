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
    messages = [];
    //dialog: string = '';
    @ViewChild('messageInput') messageInput: ElementRef;
    chat: Chat;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userId: string;
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
        // Chat
        this._activatedRoute.params.subscribe(params => {
          this.userId = params['id'];
          console.log('User ID from route:', this.userId);
      
          // Rest of your logic...
        });
        this._chatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) =>
            {
                this.chat = chat;
                console.log('comp chat',chat)
                //test start
                console.log('chat.messages', chat.messages);
                //test stop
                // Mark for check
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

  
    /*
      sendMessage() {
        console.log('send message was clicked',this.message)
        if (this.message.trim()) {
          //this.chatService.postMessageToDb({ message: this.message }).subscribe(
            // Update the chat on the server
            console.log('to update',this.message)
            console.log('currently passed to service this.chat.id',this.chat.id)
            console.log('currently passed to service this.chat',this.chat)
        this._chatService.updateChat(this.chat.id, this.chat).subscribe(  
            response => {
              console.log('Message sent', response);
              this.message = ''; // Clear the message input after sending
            },
            error => {
              console.error('Error sending message', error);
            }
          );
        }
      }
     */
    
      sendMessage() {
        console.log('send message was clicked', this.message);
        if (this.message.trim()) {
          // Immediately display the user's message
          /*
          const userMessage = {
           // id:'dsds11',
           // chatId:'ff6bc7f1-449a-4419-af62-b89ce6cae0aa',
           chatId: this.userId, // Use the userId obtained from the route
            isMine: true,
            value: this.message,
            //createdAt:'2024-01-14T19:04:38.445-05:00' // Adjust date format as needed 2024-01-14T19:04:38.445-05:00 - new Date() 
          };
          */
          const userMessage = {
            enaikoChatId: this.userId, // Use the userId obtained from the route
             isMine: true,
             value: this.message,
             msgType:'C',
             src:'web'
           };
          //id?: string; chatId?: string; contactId?: string; isMine?: boolean; value?: string; createdAt?: string; 

          console.log('userMessage',userMessage);
          this.chat.messages.push(userMessage);
      
         // Send the message to the server
          this._chatService.sendMessageToServer(this.message, this.userId).subscribe(response => {
            // Handle server response here
            // For example, display bot's response
            console.log('came here',response)
            
            response.botReply=response.message + 'bot resp'
            const botResponse = {
              enaikoChatId: this.userId,
              isMine: false,
              value: response.botReply, // Assuming response contains botReply
              msgType:'C',
              src:'web'
            };
            console.log('botResponse',botResponse)
            //this.message = '';
            this._changeDetectorRef.markForCheck();
            this.chat.messages.push(botResponse);
            
            
          }, error => {
            console.error('Error sending message', error);
          });
          // Clear the message input
          this.message = '';
          this._changeDetectorRef.markForCheck();
        }
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
