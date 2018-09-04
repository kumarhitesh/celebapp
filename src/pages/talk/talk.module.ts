import { IonicPageModule } from "ionic-angular";
import { NgModule } from "@angular/core";
import { TalkPage } from "./talk";

@NgModule({
  declarations: [
    TalkPage
  ],
  imports: [
    IonicPageModule.forChild(TalkPage)
  ],
  entryComponents: [
    TalkPage
  ]
})

export class TalkPageModule { }
