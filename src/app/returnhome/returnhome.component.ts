import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';
import { User } from '../../models/User';
import UIkit from 'uikit';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-returnhome',
  templateUrl: './returnhome.component.html',
  styleUrls: ['./returnhome.component.scss']
})

export class ReturnhomeComponent implements OnInit {
  credits: number;
  loggedin: boolean = true;
  openVerify: true;
  lblShow:boolean = true;
  passType: string = "password";
  verErrorMes: boolean = false;
  bannersSet2: boolean = true;

  get hasCashback(): number {
    return this._cashBackAmount;
  }
  get isSubscribed(): boolean {
    return this._isSubscribed;
  }

  get isChecked(): boolean {
    return this._isChecked;
  }

  get gamesPlayed(): number {
    return this._gamesPlayed;
  }

  get gamesPlayedToday(): number {
    // console.log("Games Played: "+this.sessionService.gamesPlayed)
    return this.sessionService.gamesPlayed;
  }

  public winnersElig:boolean = true;
  public sportsElig:boolean = false;
  public horosElig:boolean = false;
  public hasDoubledToday:boolean = false;

  // Check if already a subscribed player
  private _isSubscribed = false;
  // Check if he has cashback waiting
  public _cashBackAmount = 0;
  // Check if check is checked so he can click the button
  private _isChecked = false;
  // How many (1st free or billable) games the user has played
  public _gamesPlayed = 0;

  public  servicesOpened:boolean = false;

  public errorMsg = "";
  public noMoreRealGames = "Unfortunately, your current plan is not allowed to participate.\nTry using another number.";
  public noMoreDemoGames = "No more demo games available! \n Why don't you try the real thing?";

  checkCheckBoxvalue(event){

    this._isChecked = event.target.checked;
  }

  GoSubscribe() {

  }

  startGame() {

      this.sessionService.gamesPlayed++;
      this.sessionService.credits--;


      this.router.navigate(['game']);

  }

  startFreeGame() {
    this.router.navigate(['freetimegame']);
  }

  constructor(private dataService: DataService, private sessionService: SessionService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {

    // user login validation check
    if (!this.sessionService.token || !this.sessionService.isSubscribed || !this.sessionService.isEligible) {
      // wanna inform the user here?

      // Redirect him to Home
      // this.router.navigate(['/home'], { queryParams: { errorCode: 401 } });
    }
    else if (!this.sessionService.isEligible) {
      this.router.navigate(['/home'], { queryParams: { errorCode: 1026 } });
    }
    else {

      this._isSubscribed = this.sessionService.isSubscribed;

      // Services Check
      // VIVACLUB-421   [Bedbug] Swipe and WIN | Hide Sports Club & Horoscopes Banners
      if (this.sessionService.subscribedAtWinnersClubAt == null)
        this.winnersElig = true;
      else
        this.winnersElig = false;

      // if (this.sessionService.subscribedAtSportsClubAt == null)
      //   this.sportsElig = true;
      // else
        this.sportsElig = false;

      // if (this.sessionService.subscribedAtHoroscopesAt == null)
      //   this.horosElig = true;
      // else
        this.horosElig = false;


      // Doubled Check
      //if(this.sessionService.hasDoubledAtSportsClubAt == null && this.sessionService.hasDoubledAtWinnersClubAt == null && this.sessionService.hasDoubledAtHoroscopesAt == null)
      if(this.sessionService.hasDoubledAtWinnersClubAt == null)
        this.hasDoubledToday = false;
        else
        this.hasDoubledToday = true;




      // If has not played today open play button
      // If already played so played for today view

      this.dataService.getUserProfile().subscribe(
        (data: any) => {


          this.sessionService.user = data;
          this._gamesPlayed = this.sessionService.gamesPlayed;



          this.CheckCredits();
          // Set Properties here
          // this._gamesPlayed = 3;
          // this._cashBackAmount = this.sessionService.user.wallet.pendingMaturityCashback + this.sessionService.user.wallet.pendingTransferCashback;
        },
        (err) => {

        }

      );
    }
  }

  CheckCredits() {


      this.sessionService.hasCredit();

  }

  OpenOTPPurchase() {

    // Start OTP proccess for new game purchace
    // Send PIN
    // Verify user Input
    // If success purchaceCredit
    this.dataService.purchaseCreditRequest().subscribe((resp: any) => {

      // Open Modal
      let modal = UIkit.modal("#otp");
      modal.show();
    },
      (err: any) => {

        let modal = UIkit.modal("#error");
        modal.show();
      });
  }


  OpenPass(){
    this.lblShow = !this.lblShow;

    if(this.lblShow)
      this.passType = "password";
    else
      this.passType = "test";
  }

  verify(pass: string) {

    this.dataService.purchaseCredit(pass).subscribe((resp: any) => {

      // Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('x-access-token');
      if (userToken)  // if exists, keep it
        this.sessionService.token = userToken;

     // Close the modal if pin & purchase are success
      let modal = UIkit.modal("#otp");
      modal.hide();

      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);

      if (body.credits > 0)
        this.sessionService.credits = body.credits;



      this.sessionService.user = body;
      this._gamesPlayed = this.sessionService.gamesPlayed;


      if (this.sessionService.credits > 0) {
        // Burn Credit
            this.startGame();
      }
    },
      (err: any) => {
        // If Purchase is not Success Open Error Modal and close OTP modal (Then return to home)


        if (err.error) {
          const errorCode = err.error.errorCode;

          if (errorCode === 1007) {
            // pin verification problem, pin invalid or wrong

            // If PIN is incorect show a text error
            this.verErrorMes = true;
          }
          else if (errorCode === 1004) {
            // user is not eligible to buy credits
          }
          else {
            // transaction could not be completed by the system, system error
            let modal = UIkit.modal("#error");
            modal.show();
          }
        } else {
          let modal = UIkit.modal("#error");
          modal.show();
        }

      });
  }

  resetPin() {

  }
  returnHome() {
    this.servicesOpened = false;
    document.body.classList.remove('winnersBg','horoscopesBg','sportsBg');
    this.router.navigate(['returnhome']);
  }

  OpenWinners() {
    this.servicesOpened = true;
    document.body.classList.add('winnersBg');
    // var modalDefault = UIkit.modal("#result", {escClose: false, bgClose: false});
    // modalDefault.hide();
    var modalWinners = UIkit.modal("#winners", {escClose: false, bgClose: false});
    modalWinners.show();
  }

  SubWinners() {
    this.dataService.subscribeGoingUpWinnersClub(this.sessionService.msisdn, this.translate.currentLang).subscribe((resp: any) => {
      // Deserialize payload
      const body: any = resp.body;
      console.table(body);
      this.hasDoubledToday = true;
      this.returnHome();
      if (body.errorCode) {
        // switch (errorCode) {
        //   case '401': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('401'); break;
        //   case '1010': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1010'); break;
        //   case '1026': this.errorMsg = this.blackListed; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1026'); break;
        //   case '1023': this.errorMsg = this.noMoreRealGames; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1021': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1025': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        // }
          console.log(body.error);
      }
    },
    (err: any) => {

    });
  }

  OpenHoroscopes() {
    this.servicesOpened = true;
    document.body.classList.add('horoscopesBg');
    // var modalDefault = UIkit.modal("#result", {escClose: false, bgClose: false});
    // modalDefault.hide();
    var modalHoroscopes = UIkit.modal("#horoscopes", {escClose: false, bgClose: false});
    modalHoroscopes.show();
  }

  SubHoroscopes() {
    this.dataService.subscribeGoingUpHoroscope(this.sessionService.msisdn, this.translate.currentLang).subscribe((resp: any) => {
      // Deserialize payload
      const body: any = resp.body;
      console.table(body);
      this.hasDoubledToday = true;
      this.returnHome();
      if (body.errorCode) {
        // switch (errorCode) {
        //   case '401': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('401'); break;
        //   case '1010': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1010'); break;
        //   case '1026': this.errorMsg = this.blackListed; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1026'); break;
        //   case '1023': this.errorMsg = this.noMoreRealGames; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1021': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1025': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        // }
          console.log(body.error);
      }
    },
    (err: any) => {

    });
  }

  OpenSports() {
    this.servicesOpened = true;
    document.body.classList.add('sportsBg');
    // var modalDefault = UIkit.modal("#result", {escClose: false, bgClose: false});
    // modalDefault.hide();
    var modalSports = UIkit.modal("#sports", {escClose: false, bgClose: false});
    modalSports.show();
  }

  SubSports() {
    this.dataService.subscribeGoingUpChampionsClub(this.sessionService.msisdn, this.translate.currentLang).subscribe((resp: any) => {
      // Deserialize payload
      const body: any = resp.body;
      console.table(body);
      this.hasDoubledToday = true;
      this.returnHome();
      if (body.errorCode) {
        // switch (errorCode) {
        //   case '401': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('401'); break;
        //   case '1010': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1010'); break;
        //   case '1026': this.errorMsg = this.blackListed; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1026'); break;
        //   case '1023': this.errorMsg = this.noMoreRealGames; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1021': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        //   case '1025': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
        // }
          console.log(body.error);
      }
    },
    (err: any) => {

    });
  }
}
