import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import {Constants} from 'src/app/config/constants'
@Component({
  selector: 'app-login',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  weatherData:any;
  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor( private weatherService:WeatherService) { }

  ngOnInit(): void {
    this.form = {
      city: 'New York'
    };
    this.weatherData = {
      main : {},
      isDay: true
    };
    this.onSubmit();
  }

  onSubmit(): void {
    // here we call the weatherService to retrive the weather 
    let url:string = Constants.API_ENDPOINT_WEATHER+this.form.city;
    console.log(url);
    this.weatherService.getWeatherData(url).subscribe(
      data => {
        this.setWeatherData(data);
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );
  }
  setWeatherData(data:any){
    this.weatherData=data;
    let sunsetTime = new Date(this.weatherData.sys.sunset,1000);
    this.weatherData.sunset_time=sunsetTime.toLocaleTimeString();
    let currentDate = new Date();

    //convert calvin to celsiuns.
    
    this.weatherData.isDay = (currentDate.getTime() < sunsetTime.getTime());
    this.weatherData.temp_celcius = (this.weatherData.main.temp - 273.15).toFixed(0);
    this.weatherData.temp_min = (this.weatherData.main.temp_min - 273.15).toFixed(0);
    this.weatherData.temp_max = (this.weatherData.main.temp_max - 273.15).toFixed(0);
    this.weatherData.temp_feels_like = (this.weatherData.main.feels_like - 273.15).toFixed(0);

  }
}
