import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Chat, Contact, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class ChatService
{
    private _chat: BehaviorSubject<Chat> = new BehaviorSubject(null);
    private _chats: BehaviorSubject<Chat[]> = new BehaviorSubject(null);
    private _contact: BehaviorSubject<Contact> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<Contact[]> = new BehaviorSubject(null);
    private _profile: BehaviorSubject<Profile> = new BehaviorSubject(null);
    product: any;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for chat
     */
    get chat$(): Observable<Chat>
    {   
        console.log('inside get chat$')
        return this._chat.asObservable();
    }

    /**
     * Getter for chats
     */
    get chats$(): Observable<Chat[]>
    {   
        console.log('inside get chats$')
        return this._chats.asObservable();
    }

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact>
    {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<Contact[]>
    {
        return this._contacts.asObservable();
    }

    /**
     * Getter for profile
     */
    get profile$(): Observable<Profile>
    {
        return this._profile.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get chats
     */
    getChats(): Observable<any>
    {
        return this._httpClient.get<Chat[]>('api/apps/chat/chats').pipe(
       
            tap((response: Chat[]) =>
            {
                console.log('inside get chats',response)
                this._chats.next(response);
            }),
        );

    }

    /**
     * Get contact
     *
     * @param id
     */
    getContact(id: string): Observable<any>
    {
        return this._httpClient.get<Contact>('api/apps/chat/contacts', {params: {id}}).pipe(
            tap((response: Contact) =>
            {
                this._contact.next(response);
            }),
        );
    }

    /**
     * Get contacts
     */
    getContacts(): Observable<any>
    {
        return this._httpClient.get<Contact[]>('api/apps/chat/contacts').pipe(
            tap((response: Contact[]) =>
            {
                this._contacts.next(response);
            }),
        );
    }

    /**
     * Get profile
     */
    getProfile(): Observable<any>
    {
        return this._httpClient.get<Profile>('api/apps/chat/profile').pipe(
            tap((response: Profile) =>
            {
                this._profile.next(response);
            }),
        );
    }

    /**
     * Get chat
     *
     * @param id
     */
    getChatById(id: string): Observable<any>
    {   
        console.log('inside get by chat id')
        return this._httpClient.get<Chat>('api/apps/chat/chat', {params: {id}}).pipe(
       // return this._httpClient.get<Chat>('https://gmb5mklxy1.execute-api.us-east-1.amazonaws.com/default/enaikoHomeChat', {params: {id}}).pipe(
       // return this._httpClient.get<Chat>('https://2sdr7cfqdf.execute-api.us-east-1.amazonaws.com/default/enaikoHomeChat', {params: {id}}).pipe(
            map((chat) =>
            {
                // Update the chat
                console.log('chat',chat)
                this._chat.next(chat);

                // Return the chat
                return chat;
            }),
            switchMap((chat) =>
            {
                if ( !chat )
                {
                    return throwError('Could not found chat with id of ' + id + '!');
                }

                return of(chat);
            }),
        );
    }

    sendMessageToServer(message: string, chatId: string): Observable<any> {
        
        /*
        const newItem = {
          chatId: chatId,
          message: message
        };
        */
        const newItem = {
            enaikoChatId: chatId,
            msg: message,
            msgType:'C',
            src:'web',
            isMine: true
          };
        console.log('inside service call',newItem)
        //return this._httpClient.post<any>('https://gmb5mklxy1.execute-api.us-east-1.amazonaws.com/default/enaikoHomeChat', newItem);
        return this._httpClient.post<any>('https://2sdr7cfqdf.execute-api.us-east-1.amazonaws.com/default/enaikoHomeChat', newItem);
      }
    /*
            enaikoChatId: this.userId, // Use the userId obtained from the route
             isMine: true,
             msg: this.message,
             msgType:'C',
             src:'web'
    */
     
    /**
     * Update chat
     *
     * @param id
     * @param chat
     * @returns {Promise<any>}
     */
    //updateChat(id: string, chat: Chat): Observable<Chat>
    //updateChat(id: string, chat: Chat): Observable<Chat>
    //updateChat(id: string, chat: Chat)
   
    updateChat(id: string, message: string): Promise<any> 
    
        {   
            
            //console.log("params id3:" + this.routeParams.id);
            return new Promise(async (resolve, reject) => {
                try {
                  // Retrieve the ID token
                
          
                  // Make the HTTP request to the specified API endpoint
                  //const response = await this._httpClient.post<any[]>('https://mx38b2hrua.execute-api.us-east-1.amazonaws.com/stg/domain/' {}).toPromise();
                 // this.product = response;
                  //this.onProductChanged.next(this.product);
                  //resolve(response);
                } catch (error) {
                  console.error('Error fetching products:', error);
                  reject(error);
                }
              });   
       }
    /*
    {   
        console.log('inside updatechat service id',id)
        console.log('inside updatechat service chat',message)
        return message
        /*
        return this.chats$.pipe(
            take(1),
            //const response = await this._httpClient.post<any[]>('https://gmb5mklxy1.execute-api.us-east-1.amazonaws.com/default/enaikoHomeChat', newItem,{ headers: headers }).toPromise();
            switchMap(chats => this._httpClient.patch<Chat>('api/apps/chat/chat', {
                id,
                chat,
            }).pipe(
                map((updatedChat) =>
                {
                    // Find the index of the updated chat
                    const index = chats.findIndex(item => item.id === id);

                    // Update the chat
                    chats[index] = updatedChat;
                    console.log('chats',chats)
                    // Update the chats
                    this._chats.next(chats);

                    // Return the updated contact
                    return updatedChat;
                }),
                switchMap(updatedChat => this.chat$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() =>
                    {
                        // Update the chat if it's selected
                        this._chat.next(updatedChat);

                        // Return the updated chat
                        return updatedChat;
                    }),
                )),
            )),
        );
        
    }

    */

    /**
     * Reset the selected chat
     */
    resetChat(): void
    {
        this._chat.next(null);
    }
}
