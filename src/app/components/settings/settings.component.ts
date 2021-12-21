import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/config/constants';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  form: any = {};
  constructor() { }

  ngOnInit() {
    this.form.url_service = Constants.API_ENDPOINT_WEATHER;
  }
}
