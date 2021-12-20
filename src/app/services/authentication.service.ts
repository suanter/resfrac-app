import { Injectable,  ChangeDetectorRef} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const electron = (<any>window).require('electron');
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  user = new BehaviorSubject({});
  value={}
  constructor() {
    
    electron.ipcRenderer.on('user_logged_out', (event, user) => {
      console.log("Authorization Service => user user_logged_out status");
      this.user.next(user);
      console.log(user);
    });

  electron.ipcRenderer.on('user_logged', (event, user) => {
      console.log("Authorization Service => user user_logged status");
      this.user.next(user);
      console.log(user);
    });
    this.user.subscribe( (e) => this.value = e );
   }
  login(){
    electron.ipcRenderer.send('login_user', "start");
  }
  logout(){
    electron.ipcRenderer.send('logout_user', "start");
  }
  getUserInformation(){
    electron.ipcRenderer.send('user_logged');
  }
  getAuthStatus(){
    let value;
    this.user.subscribe( (e) => value = e );
    console.log("getAuthStatus");
    console.log(value)
    if (value)
        return value['logged']
    return  false;
  }
}
