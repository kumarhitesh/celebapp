import { Component, OnInit, ViewChild } from '@angular/core';
import { Nav, ToastController, Platform, NavController, NavParams, IonicPage } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import "rxjs/add/operator/map";
import { HomePage } from '../home/home';
import { AppSettings } from './../../config/settings';

declare var OT: any;

@IonicPage({
  name: 'talk',
  segment: 'talk/:sessionId/:tbSessionId'
})

@Component({
  selector: 'page-talk',
  templateUrl: 'talk.html'
})
export class TalkPage implements OnInit {
  @ViewChild(Nav) nav: Nav;

  minutesLabel: any
  secondsLabel: any
  totalSeconds: number = 0;
  session: any;
  publisher: any;
  apiKey: any;
  sessionId: string;
  token: any;
  endSessionId: any;
  param: any;
  countDownDuration: any;
  callDuration: any;
  public highlightSpeaker: boolean = false;
  public showProfileDetails = false;
  public showProfileDetailsUp = false;
  public showProfileDetailsLeft = false;
  public isMute = false;
  public isvideo = false;
  public isBookmarked = false;
  public isVideoOn = false;
  public controle = true;
  public apiUrl: string;
  public users: Observable<any>;
  public numresults: 5;
  public sessionData: any;
  public callTime: any;
  public toastItem: any;
  allEvents: any;

  constructor(public toastCtrl: ToastController, public ptl: Platform, private navCtrl: NavController, public navParams: NavParams, private http: HttpClient) {
    this.apiKey = AppSettings.TB_API_KEY;
    this.param = navParams.get('sessionId');
    this.sessionId = navParams.get('tbSessionId');
    this.apiUrl = AppSettings.API_ENDPOINT + '/session/';
    this.callDuration = navParams.get('callDuration');
    this.callTime = navParams.get('callTime')


  }

  ngOnDestroy(): void {
    if (this.session) {
      this.session.disconnect();
    }
  }

  ngOnInit(): void {
    this.toast('Connecting: SuperFan…');

    setTimeout(() => {
      this.duration();

      // this.endSessionId = this.param;
      const Minutes = 60 * this.callDuration,
        display = document.querySelector('#time');
      this.startTimer(Minutes, display);
    }, 10);

    this.getSession().subscribe((res) => {
      this.sessionData = res;
    });

    this.getToken().subscribe((res: any) => {
      this.token = res.token;
      this.startCall()
    })


    const duration = (this.callDuration * 60) * 1000;
    let startTime = new Date(this.callTime).getTime();
    const endTime = startTime + duration;

    let myInterval = setInterval(() => {
      startTime = new Date().getTime();
      if (endTime < startTime) {
        this.toast('Call is ended.');
        this.controle = false;
        this.isVideoOn = false;
        clearInterval(myInterval);
      }
    }, 1000)

    // let voulmeUP = setInterval(() => {
    //   const width = document.querySelector('.OT_audio-level-meter__value').clientWidth;
    //   console.log(width);
    // }, 1)

  }
  // public callEndedAlert() {
  //   let alert = this.alertCtrl.create({
  //     subTitle: 'Call completed',
  //     message: 'Call duration was ' + this.callDuration + ' min',
  //     buttons: ['OK'],
  //     cssClass: 'custom-alert',

  //   });
  //   alert.present();
  // }

  public duration() {
    this.minutesLabel = document.getElementById("minutes");
    this.secondsLabel = document.getElementById("seconds");
    setInterval(() => {
      ++this.totalSeconds;
      this.secondsLabel.innerHTML = this.pad(this.totalSeconds % 60);
      this.minutesLabel.innerHTML = parseInt(this.pad(this.totalSeconds / 60), 10);
    }, 1000);
  }

  public startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    setInterval(() => {
      minutes = timer / 60, 10
      seconds = timer % 60, 10;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      display.textContent = parseInt(minutes, 10) + ":" + parseInt(seconds, 10);
      if (--timer < 0) {
        timer = duration;
      }
    }, 1000);

  }

  public endCall() {
    this.session.disconnect();
    this.navCtrl.push(HomePage);
    // this.utilProvider.setCallbackStatus(false, this.param);
  }


  public toast(toastMessage: string) {
    this.toastItem = this.toastCtrl.create({
      message: toastMessage,
      duration: 10000,
      position: 'middle',
      showCloseButton: true,
      closeButtonText: 'close',
      cssClass: 'custom-toast',
      dismissOnPageChange: true
    });

    this.toastItem.present();
  }


  public toggleProfileDetailsUp() {
    this.showProfileDetailsUp = !this.showProfileDetailsUp;
  }
  public toggleProfileDetailsLeft() {
    this.showProfileDetailsLeft = !this.showProfileDetailsLeft;
  }

  public toggleMute() {
    this.publisher.publishAudio(this.isMute)
    this.isMute = !this.isMute;
    if (this.isMute == true) {
      this.toast('Audio on mute.');
    }
    else {
      this.toast('Audio is live.');
    }
  }

  public togglevideo() {
    this.publisher.publishVideo(this.isvideo)
    this.isvideo = !this.isvideo;
    if (this.isvideo == true) {
      this.toast('Video is paused.');
    }
    else {
      this.toast('Video is live.');
    }
  }

  public toggleBookMarked() {
    this.isBookmarked = !this.isBookmarked;
  }

  public pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
  }

  public startCall() {
    this.session = OT.initSession(this.apiKey, this.sessionId);

    this.session.on({
      streamCreated: (event) => {
        this.session.subscribe(event.stream, 'subscriber', {
          insertMode: 'append',
          width: '100%',
          height: '100%',
          // style: { buttonDisplayMode: 'on' }
        });
        this.toastItem.dismiss();
      },
      streamDestroyed: (event) => {
        console.log(`Stream ${event.stream.name} ended because ${event.reason}`);
      }
    });

    this.session.connect(this.token, () => {
      this.isVideoOn = true;


      this.publisher = OT.initPublisher('publisher', {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        style: { buttonDisplayMode: 'on', audioLevelDisplayMode: 'on' },

      });
      // this.publisher.on('videoElementCreated', function (event) {
      //   console.log(event.element);
      //   console.log('Style is: ', event.target.getStyle());
      //   console.log(event.target);
      // });

      // this.publisher.setStyle('audioLevelDisplayMode', 'off');
      let movingAvg = null;
      this.publisher.on('audioLevelUpdated', (event) => {
        if (movingAvg === null || movingAvg <= event.audioLevel) {
          movingAvg = event.audioLevel;
        } else {
          movingAvg = 0.7 * movingAvg + 0.3 * event.audioLevel;
        }

        // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
        let logLevel = (Math.log(movingAvg) / Math.LN10) / 1.5 + 1;
        logLevel = Math.min(Math.max(logLevel, 0), 1);
        if (logLevel > 0.1) {
          this.highlightSpeaker = true;
        } else {
          this.highlightSpeaker = false;
        }
      });
      console.log('publishing', this.publisher);
      this.session.publish(this.publisher);
      this.toast('Connected');

    });
  }

  public getSession() {
    return this.http.get(this.apiUrl + this.param).
      map((res) => {
        return res;
      })
  }

  public getToken() {
    return this.http.get(this.apiUrl + 'token/' + this.sessionId).
      map((res) => {
        return res;
      })
  }
}
