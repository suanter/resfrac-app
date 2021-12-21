import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
const electron = (<any>window).require('electron');
import {
  Router
} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'ResFrac Assign';
  user = {}
  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    electron.ipcRenderer.on('user_logged', (event, user) => {
      console.log("User user_logged status");
      this.user = user;
      this.cdr.detectChanges();
      console.log(user);
    });

  }
  loadWeather() {
    this.redirectTo("/weather");
  }
  redirectTo(uri: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
  }
  ngOnInit() {

  }
}
