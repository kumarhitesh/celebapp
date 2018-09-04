import { AppSettings } from './../../config/settings';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Nav, NavController, IonicPage, Platform, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map'

declare var cordova;

@IonicPage({
  name: 'home',
  segment: 'home',
})

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnDestroy, OnInit {
  @ViewChild(Nav) nav: Nav;

  // public callbackStatusSubscription: any;
  // public callbackStatus: boolean;
  public endSessionid
  public sessions: any;
  private apiUrl = AppSettings.API_ENDPOINT + '/session';
  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    public plt: Platform,
    public loadingCtrl: LoadingController
  ) {

    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: `Loading`,
      dismissOnPageChange: true
    })

    loading.present();

    this.getSessions().subscribe((res) => {
      this.sessions = res;
      this.checkExpiredSessions();
      loading.dismiss();
    });

    this.setupPermissions();
  }

  public setupPermissions() {
    if (this.plt.is('cordova')) {
      cordova.plugins.diagnostic.requestRuntimePermissions(function (statuses) {
        for (var permission in statuses) {
          switch (statuses[permission]) {
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
              console.log("Permission granted to use " + permission);
              break;
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
              console.log("Permission to use " + permission + " has not been requested yet");
              break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
              console.log("Permission denied to use " + permission + " - ask again?");
              break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
              console.log("Permission permanently denied to use " + permission + " - guess we won't be using it then!");
              break;
          }
        }
      }, function (error) {
        console.error("The following error occurred: " + error);
      }, [
          cordova.plugins.diagnostic.permission.CAMERA,
          cordova.plugins.diagnostic.permission.RECORD_AUDIO
        ]);
    }
  }


  public checkExpiredSessions() {
    setInterval(() => {
      this.sessions.forEach(session => {
        var now = new Date().getTime();
        var time = new Date(session.time).getTime();
        var duration = session.duration * 60 * 1000;
        if (now > time + duration) {
          session.expired = true;
        }
        else {
          session.expired = false;
        }
        if ((now >= time) && (now <= (time + duration))) {
          session.callEnabel = true;
        } else if (!session.expired) {
          session.callEnabel = false;
        }
      });
    }, 1000)
  };


  public ngOnInit() {
    // this.callbackStatusSubscription = this.utilProvider.getCallbackStatus().subscribe(result => {
    //   this.callbackStatus = result.status;
    //   this.endSessionid = result.endSessionId;
    // });
  }



  public ngOnDestroy() {
    // this.callbackStatusSubscription.unsubscribe();
  }

  public goTotalkPage(id, tbSessionId, time, duration) {
    this.navCtrl.setRoot('talk', {
      sessionId: id,
      tbSessionId: tbSessionId,
      callTime: time,
      callDuration: duration
    });
  }

  public getSessions() {
    return this.http.get(this.apiUrl).
      map((res) => {
        return res;
      })
  }

}
