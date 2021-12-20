import { Component, OnInit, NgZone , ChangeDetectorRef} from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import {
  Router
} from "@angular/router";
const electron = (<any>window).require('electron');
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {
  user = new BehaviorSubject({});
  constructor(private authorizationService:AuthenticationService, private router: Router, private zone: NgZone, private cdr: ChangeDetectorRef) { 
  electron.ipcRenderer.on('user_logged_out', (event, user) => {
    console.log("LogoutComponent Service => event logged out");
    this.user.next(user);
    this.cdr.detectChanges();
    this.zone.run(() => {
      this.router.navigate(['/']);
      });
     });
  }

  ngOnInit() {
   
  }
  logout(){
  this.authorizationService.logout();
  }
}
