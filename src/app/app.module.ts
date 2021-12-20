import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WeatherComponent } from './components/weather/weather.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthenticationService } from './services/authentication.service';
import { WeatherService } from './services/weather.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule  } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent,
    WelcomeComponent,
    SettingsComponent,
    LogoutComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [AuthenticationService,WeatherService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
