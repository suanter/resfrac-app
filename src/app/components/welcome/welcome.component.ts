import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { BehaviorSubject } from 'rxjs';
import {
  Router
} from "@angular/router";
const electron = (<any>window).require('electron');
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  user = new BehaviorSubject({});
  constructor(private authenticationService: AuthenticationService, private router: Router, private zone: NgZone, private cdr: ChangeDetectorRef) {
    electron.ipcRenderer.on('user_logged', (event, user) => {
      console.log("User user_logged status");
      this.user.next(user);
      this.cdr.detectChanges();
      this.zone.run(() => {
        this.router.navigate(['/weather']);
      });
    });
  }

  ngOnInit() {

  }
  login(action: String) {
    console.log("Sending login request");
    this.authenticationService.login();
  }
  logout() {
    this.authenticationService.logout();
  }
}
