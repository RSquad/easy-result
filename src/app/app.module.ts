import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContestComponent } from './contest/contest.component';
import { ContestStatePipe } from './contest-state.pipe';
import { SubmsComponent } from './subms/subms.component';
import { VotesComponent } from './votes/votes.component';
import { PrunePipe } from './prune.pipe';
import { SettingsComponent } from './settings/settings.component';
import { JuryComponent } from './jury/jury.component';

@NgModule({
  declarations: [AppComponent, ContestComponent, ContestStatePipe, SubmsComponent, VotesComponent, PrunePipe, SettingsComponent, JuryComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
